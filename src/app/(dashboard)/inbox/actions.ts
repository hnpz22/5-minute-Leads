"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, conversations, messages } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { getProvider } from "@/lib/channels/registry";

export async function connectWhatsappChannel(formData: FormData) {
  const { orgId } = await requireOrg();
  const externalId = String(formData.get("externalId") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim() || null;
  if (!externalId) throw new Error("Falta el Phone Number ID");

  await db.insert(channels).values({
    orgId,
    type: "whatsapp",
    externalId,
    displayName,
  });
  revalidatePath("/inbox");
}

export async function sendReply(formData: FormData) {
  const { orgId } = await requireOrg();
  const conversationId = String(formData.get("conversationId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!conversationId || !text) throw new Error("Falta conversación o texto");

  const [row] = await db
    .select({ conv: conversations, channel: channels })
    .from(conversations)
    .innerJoin(channels, eq(conversations.channelId, channels.id))
    .where(and(eq(conversations.id, conversationId), eq(conversations.orgId, orgId)))
    .limit(1);
  if (!row) throw new Error("Conversación no encontrada");

  const provider = getProvider(row.channel.type);
  const sent = await provider.sendText({
    channelExternalId: row.channel.externalId,
    to: row.conv.externalId,
    text,
  });

  const now = new Date();
  await db.insert(messages).values({
    orgId,
    conversationId,
    direction: "outbound",
    externalId: sent.externalMessageId,
    body: text,
    fromAgent: false,
  });
  await db
    .update(conversations)
    .set({ lastMessageAt: now, firstResponseAt: row.conv.firstResponseAt ?? now })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/inbox/${conversationId}`);
}
