import type { ChannelKind, ChannelProvider } from "./types";
import { whatsappProvider } from "./meta-whatsapp";

const providers: Partial<Record<ChannelKind, ChannelProvider>> = {
  whatsapp: whatsappProvider,
  // instagram: instagramProvider,   // F2 siguiente
  // evolution: evolutionProvider,   // sandbox
};

export function getProvider(kind: ChannelKind): ChannelProvider {
  const p = providers[kind];
  if (!p) throw new Error(`Canal no soportado: ${kind}`);
  return p;
}
