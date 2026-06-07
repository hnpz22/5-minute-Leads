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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contactos</h1>
        <Link
          href="/contacts/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Nuevo contacto
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          Aún no hay contactos. Crea el primero o llegarán solos por WhatsApp/Instagram (F2).
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Origen</th>
                <th className="px-4 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {c.whatsapp ?? c.phone ?? c.email ?? c.instagram ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{c.source ?? "—"}</td>
                  <td className="px-4 py-2">{c.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
