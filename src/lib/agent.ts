import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

export const triageSchema = z.object({
  intent: z
    .enum(["consulta_precio", "agendar", "soporte", "interes_general", "spam", "otro"])
    .describe("Intención principal del lead"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Qué tan caliente es el lead (0 frío, 100 listo para comprar)"),
  suggestedReply: z
    .string()
    .describe("Respuesta lista para enviar al lead: cálida, breve, con 1 pregunta de cualificación"),
  needsHuman: z
    .boolean()
    .describe("true si requiere un humano (queja, negociación, caso complejo)"),
});

export type Triage = z.infer<typeof triageSchema>;

const SYSTEM = `Eres el asistente comercial de la empresa. Un lead escribió por WhatsApp.
Tu trabajo: responder en <5 minutos de forma cálida y humana (español neutro/LatAm),
acusar recibo, y hacer UNA sola pregunta de cualificación que ayude a avanzar la venta.
No inventes precios ni datos que no tengas. Si es queja, negociación dura o algo delicado,
marca needsHuman=true y deja una respuesta puente ("ya te conecto con un asesor").
Mantén la respuesta corta (máx 2-3 frases).`;

/** Triage + redacción de respuesta para un mensaje entrante. */
export async function triageLead(opts: {
  businessName?: string;
  history: { direction: "inbound" | "outbound"; body: string }[];
  message: string;
}): Promise<Triage> {
  const transcript = opts.history
    .map((m) => `${m.direction === "inbound" ? "Lead" : "Nosotros"}: ${m.body}`)
    .join("\n");

  const { object } = await generateObject({
    model: groq(MODEL),
    schema: triageSchema,
    system: SYSTEM,
    prompt: `Empresa: ${opts.businessName ?? "(sin nombre)"}
Conversación hasta ahora:
${transcript || "(primer mensaje)"}

Nuevo mensaje del lead: "${opts.message}"

Clasifica y redacta la respuesta.`,
  });

  return object;
}
