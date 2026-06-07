import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, contacts, conversations } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { connectWhatsappChannel } from "./actions";

function speedToLead(inbound: Date | null, response: Date | null): string {
  if (!inbound || !response) return "—";
  const secs = Math.max(0, Math.round((response.getTime() - inbound.getTime()) / 1000));
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}m`;
  return `${Math.round(secs / 3600)}h`;
}

export default async function InboxPage() {
  const { orgId } = await requireOrg();

  const orgChannels = await db.select().from(channels).where(eq(channels.orgId, orgId));

  const rows = await db
    .select({
      conv: conversations,
      contactName: contacts.fullName,
    })
    .from(conversations)
    .leftJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(eq(conversations.orgId, orgId))
    .orderBy(desc(conversations.lastMessageAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bandeja omnicanal</h1>
        <p className="text-sm text-ink-muted">
          Mensajes de WhatsApp en un solo lugar. El agente responde solo en &lt;5 min.
        </p>
      </div>

      {orgChannels.length === 0 ? (
        <div className="max-w-lg rounded-lg border border-ink bg-white p-5 shadow-hard-sm">
          <h2 className="font-semibold">Conecta tu WhatsApp</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Pega el <strong>Phone Number ID</strong> de tu app de WhatsApp en Meta. Luego
            apunta el webhook a <code>/api/webhooks/whatsapp</code>.
          </p>
          <form action={connectWhatsappChannel} className="mt-4 space-y-3">
            <input
              name="externalId"
              required
              placeholder="Phone Number ID (Meta)"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <input
              name="displayName"
              placeholder="Nombre (ej. RobotSchool Ventas)"
              className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:opacity-90">
              Conectar canal
            </button>
          </form>
        </div>
      ) : (
        <div className="text-xs text-ink-muted">
          Canales: {orgChannels.map((c) => c.displayName ?? c.externalId).join(", ")}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-muted">
          Aún no hay conversaciones. Cuando un lead te escriba por WhatsApp, aparecerá aquí.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cream-alt text-left text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Último mensaje</th>
                <th className="px-4 py-2 font-medium">1ª respuesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ conv, contactName }) => (
                <tr key={conv.id} className="hover:bg-cream-alt">
                  <td className="px-4 py-2">
                    <Link href={`/inbox/${conv.id}`} className="font-medium hover:underline">
                      {contactName ?? conv.externalId}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">
                    {conv.lastMessageAt ? conv.lastMessageAt.toLocaleString("es-CO") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-lime-soft px-2 py-0.5 text-xs">
                      {speedToLead(conv.firstInboundAt, conv.firstResponseAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
