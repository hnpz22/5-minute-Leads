import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, contacts, conversations, messages } from "@/db/schema";
import { triageLead } from "@/lib/agent";
import { getProvider } from "@/lib/channels/registry";
import type { InboundMessage } from "@/lib/channels/types";

/**
 * Procesa un mensaje entrante de cualquier canal:
 *  1. Resuelve el canal → org (multi-tenant).
 *  2. Crea/actualiza el contacto y la conversación.
 *  3. Guarda el mensaje y calcula speed-to-lead.
 *  4. Llama al agente (Groq) y, si procede, auto-responde.
 *
 * Hoy se invoca directo desde el webhook. Endurecimiento futuro: envolver en
 * Inngest para durabilidad/reintentos (ver DECISIONS D5).
 */
export async function processInboundMessage(msg: InboundMessage) {
  const now = new Date();

  // 1) Canal → org
  const [channel] = await db
    .select()
    .from(channels)
    .where(
      and(eq(channels.type, msg.channelKind), eq(channels.externalId, msg.channelExternalId)),
    )
    .limit(1);
  if (!channel) {
    console.warn(`[inbound] canal no provisionado: ${msg.channelKind}/${msg.channelExternalId}`);
    return;
  }
  const orgId = channel.orgId;

  // 2a) Contacto (match por whatsapp dentro de la org)
  let [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.orgId, orgId), eq(contacts.whatsapp, msg.from)))
    .limit(1);
  if (!contact) {
    [contact] = await db
      .insert(contacts)
      .values({
        orgId,
        fullName: msg.fromName ?? msg.from,
        whatsapp: msg.from,
        source: msg.channelKind,
      })
      .returning();
  }

  // 2b) Conversación
  let [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.channelId, channel.id), eq(conversations.externalId, msg.from)),
    )
    .limit(1);
  if (!conversation) {
    [conversation] = await db
      .insert(conversations)
      .values({
        orgId,
        channelId: channel.id,
        contactId: contact.id,
        externalId: msg.from,
        firstInboundAt: now,
        lastMessageAt: now,
      })
      .returning();
  }

  // 3) Guardar mensaje entrante + actualizar conversación
  await db.insert(messages).values({
    orgId,
    conversationId: conversation.id,
    direction: "inbound",
    externalId: msg.externalMessageId,
    body: msg.text,
    raw: msg.raw,
  });
  await db
    .update(conversations)
    .set({
      lastMessageAt: now,
      firstInboundAt: conversation.firstInboundAt ?? now,
      updatedAt: now,
    })
    .where(eq(conversations.id, conversation.id));

  // 4) Agente: triage + respuesta
  const history = await db
    .select({ direction: messages.direction, body: messages.body })
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(asc(messages.createdAt));

  let triage;
  try {
    triage = await triageLead({
      businessName: channel.displayName ?? undefined,
      history: history
        .filter((h) => h.body)
        .map((h) => ({ direction: h.direction, body: h.body as string })),
      message: msg.text,
    });
  } catch (e) {
    console.error("[inbound] agente falló:", e);
    return; // el mensaje queda guardado; un humano puede responder
  }

  // Actualizar score del contacto
  await db.update(contacts).set({ score: triage.score }).where(eq(contacts.id, contact.id));

  // Auto-respuesta (human-in-the-loop): solo si no requiere humano y está habilitado
  const autoReply = process.env.AGENT_AUTO_REPLY !== "false";
  if (autoReply && !triage.needsHuman && triage.suggestedReply) {
    try {
      const provider = getProvider(msg.channelKind);
      const sent = await provider.sendText({
        channelExternalId: channel.externalId,
        to: msg.from,
        text: triage.suggestedReply,
      });
      await db.insert(messages).values({
        orgId,
        conversationId: conversation.id,
        direction: "outbound",
        externalId: sent.externalMessageId,
        body: triage.suggestedReply,
        fromAgent: true,
      });
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          firstResponseAt: conversation.firstResponseAt ?? new Date(),
        })
        .where(eq(conversations.id, conversation.id));
    } catch (e) {
      console.error("[inbound] envío de auto-respuesta falló:", e);
    }
  }

  return { triage, conversationId: conversation.id, contactId: contact.id };
}
