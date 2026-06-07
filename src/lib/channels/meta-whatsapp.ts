import type { ChannelProvider, InboundMessage, SendResult } from "./types";

const GRAPH_VERSION = "v21.0";

/**
 * Adapter de WhatsApp Cloud API (oficial de Meta).
 * Token desde env (un solo Meta app para los pilotos). Para SaaS multi-tenant
 * real, el token iría por canal (cifrado en DB).
 */
export const whatsappProvider: ChannelProvider = {
  kind: "whatsapp",

  verifyWebhook(params) {
    const mode = params.get("hub.mode");
    const token = params.get("hub.verify_token");
    const challenge = params.get("hub.challenge");
    if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  },

  parseInbound(body): InboundMessage[] {
    const out: InboundMessage[] = [];
    const root = body as MetaWebhookBody;
    for (const entry of root?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value;
        if (!value?.messages) continue;
        const phoneNumberId = value.metadata?.phone_number_id;
        const nameByWaId = new Map<string, string>();
        for (const c of value.contacts ?? []) {
          if (c?.wa_id && c?.profile?.name) nameByWaId.set(c.wa_id, c.profile.name);
        }
        for (const m of value.messages) {
          if (m.type !== "text" || !m.text?.body) continue; // F2: solo texto por ahora
          out.push({
            channelKind: "whatsapp",
            channelExternalId: phoneNumberId ?? "",
            from: m.from,
            fromName: nameByWaId.get(m.from),
            externalMessageId: m.id,
            text: m.text.body,
            raw: m,
          });
        }
      }
    }
    return out;
  },

  async sendText({ channelExternalId, to, text }): Promise<SendResult> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!token) throw new Error("WHATSAPP_ACCESS_TOKEN no configurado");
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${channelExternalId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`WhatsApp send falló (${res.status}): ${detail}`);
    }
    const data = (await res.json()) as { messages?: { id: string }[] };
    return { externalMessageId: data.messages?.[0]?.id ?? null };
  },
};

// ─── Tipos mínimos del payload de Meta ──────────────────────────────────
type MetaWebhookBody = {
  entry?: {
    changes?: {
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: {
          from: string;
          id: string;
          type: string;
          text?: { body?: string };
        }[];
      };
    }[];
  }[];
};
