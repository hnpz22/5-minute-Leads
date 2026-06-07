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
      <div>
        <Link href="/contacts" className="text-sm text-zinc-500 hover:underline">
          ← Contactos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{contact.fullName}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          {contact.whatsapp && <span>WhatsApp: {contact.whatsapp}</span>}
          {contact.instagram && <span>IG: {contact.instagram}</span>}
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          <span>Score: {contact.score}</span>
          {contact.source && <span>Origen: {contact.source}</span>}
        </div>
        {contact.notes && (
          <p className="mt-2 rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">{contact.notes}</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Actividad
        </h2>

        <form action={addActivity} className="flex gap-2">
          <input type="hidden" name="contactId" value={contact.id} />
          <input
            name="body"
            required
            placeholder="Añadir nota / interacción…"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Añadir
          </button>
        </form>

        {timeline.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin actividad todavía.</p>
        ) : (
          <ul className="space-y-2">
            {timeline.map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-zinc-200 p-3 text-sm"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="uppercase">{a.type}</span>
                  <time>{a.occurredAt.toLocaleString("es-CO")}</time>
                </div>
                {a.body && <p className="mt-1 text-zinc-700">{a.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
