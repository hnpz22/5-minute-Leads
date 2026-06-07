import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { contacts, conversations, messages } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { sendReply } from "../actions";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await requireOrg();

  const [row] = await db
    .select({ conv: conversations, contactName: contacts.fullName, contactId: contacts.id })
    .from(conversations)
    .leftJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(and(eq(conversations.id, id), eq(conversations.orgId, orgId)))
    .limit(1);
  if (!row) notFound();

  const thread = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <Link href="/inbox" className="text-sm text-ink-muted hover:underline">
            ← Bandeja
          </Link>
          <h1 className="mt-1 text-lg font-semibold">
            {row.contactName ?? row.conv.externalId}
          </h1>
        </div>
        {row.contactId && (
          <Link
            href={`/contacts/${row.contactId}`}
            className="text-sm text-ink-muted hover:underline"
          >
            Ver contacto →
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {thread.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                m.direction === "outbound"
                  ? "bg-ink text-cream"
                  : "border border-line bg-white"
              }`}
            >
              {m.body}
              <div
                className={`mt-1 text-[10px] ${
                  m.direction === "outbound" ? "text-cream/60" : "text-ink-faint"
                }`}
              >
                {m.fromAgent ? "🤖 agente · " : ""}
                {m.createdAt.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form action={sendReply} className="flex gap-2 border-t border-line pt-3">
        <input type="hidden" name="conversationId" value={row.conv.id} />
        <input
          name="text"
          required
          placeholder="Escribe una respuesta…"
          className="flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none"
        />
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:opacity-90">
          Enviar
        </button>
      </form>
    </div>
  );
}
