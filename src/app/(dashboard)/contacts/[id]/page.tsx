import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, contacts } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { addActivity } from "../actions";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await requireOrg();

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.orgId, orgId)))
    .limit(1);
  if (!contact) notFound();

  const timeline = await db
    .select()
    .from(activities)
    .where(and(eq(activities.contactId, id), eq(activities.orgId, orgId)))
    .orderBy(desc(activities.occurredAt));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-line bg-white p-5">
        <Link href="/contacts" className="text-sm text-ink-muted hover:underline">
          ← Contactos
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{contact.fullName}</h1>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              contact.score >= 70
                ? "bg-lime text-ink"
                : contact.score >= 40
                  ? "bg-lime-soft text-ink"
                  : "bg-cream-alt text-ink-muted"
            }`}
          >
            score {contact.score}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          {contact.whatsapp && <span>WhatsApp: {contact.whatsapp}</span>}
          {contact.instagram && <span>IG: {contact.instagram}</span>}
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.source && <span>Origen: {contact.source}</span>}
        </div>
        {contact.notes && (
          <p className="mt-3 rounded-md bg-cream-alt p-3 text-sm text-ink-soft">{contact.notes}</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Actividad
        </h2>

        <form action={addActivity} className="flex gap-2">
          <input type="hidden" name="contactId" value={contact.id} />
          <input
            name="body"
            required
            placeholder="Añadir nota / interacción…"
            className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:opacity-90"
          >
            Añadir
          </button>
        </form>

        {timeline.length === 0 ? (
          <p className="text-sm text-ink-faint">Sin actividad todavía.</p>
        ) : (
          <ul className="space-y-2">
            {timeline.map((a) => (
              <li key={a.id} className="rounded-md border border-line bg-white p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-ink-faint">
                  <span className="uppercase">{a.type}</span>
                  <time>{a.occurredAt.toLocaleString("es-CO")}</time>
                </div>
                {a.body && <p className="mt-1 text-ink-soft">{a.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
