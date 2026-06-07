export type ChannelKind = "whatsapp" | "instagram";

/** Mensaje entrante normalizado, agnóstico de proveedor. */
export type InboundMessage = {
  channelKind: ChannelKind;
  /** ID del canal del lado del negocio (WhatsApp = Phone Number ID). */
  channelExternalId: string;
  /** Remitente (wa_id del cliente / IGSID). */
  from: string;
  fromName?: string;
  externalMessageId: string;
  text: string;
  raw: unknown;
};

export type SendResult = { externalMessageId: string | null };

/** Contrato que todo proveedor de canal debe cumplir (meta_cloud, instagram, evolution…). */
export interface ChannelProvider {
  kind: ChannelKind;
  /** Verificación del webhook (handshake GET de Meta). Devuelve el challenge o null. */
  verifyWebhook(params: URLSearchParams): string | null;
  /** Parsea el payload entrante a mensajes normalizados. */
  parseInbound(body: unknown): InboundMessage[];
  /** Envía un texto al destinatario. */
  sendText(opts: { channelExternalId: string; to: string; text: string }): Promise<SendResult>;
}
