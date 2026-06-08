import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { contacts } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";

export default async function ContactsPage() {
  const { orgId } = await requireOrg();
  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.orgId, orgId))
    .orderBy(desc(contacts.createdAt));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
        <Link
          href="/contacts/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:opacity-90"
        >
          + Nuevo contacto
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-muted">
          Aún no hay contactos. Crea el primero o llegarán solos por WhatsApp/Instagram.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cream-alt text-left text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                <th className="px-4 py-2.5 font-medium">Contacto</th>
                <th className="px-4 py-2.5 font-medium">Origen</th>
                <th className="px-4 py-2.5 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-cream-alt">
                  <td className="px-4 py-2.5">
                    <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {c.whatsapp ?? c.phone ?? c.email ?? c.instagram ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{c.source ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        c.score >= 70
                          ? "bg-lime text-ink"
                          : c.score >= 40
                            ? "bg-lime-soft text-ink"
                            : "bg-cream-alt text-ink-muted"
                      }`}
                    >
                      {c.score}
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
