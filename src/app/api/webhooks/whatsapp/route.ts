import { NextRequest, NextResponse } from "next/server";

import { whatsappProvider } from "@/lib/channels/meta-whatsapp";
import { processInboundMessage } from "@/lib/inbound";

// Handshake de verificación de Meta (al registrar el webhook).
export async function GET(req: NextRequest) {
  const challenge = whatsappProvider.verifyWebhook(req.nextUrl.searchParams);
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Mensajes entrantes.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const inbound = whatsappProvider.parseInbound(body);
    for (const msg of inbound) {
      await processInboundMessage(msg);
    }
  } catch (e) {
    // Respondemos 200 igual para que Meta no reintente en bucle; queda en logs.
    console.error("[webhook/whatsapp] error procesando:", e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
