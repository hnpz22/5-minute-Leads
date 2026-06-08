import Link from "next/link";
import { and, eq, count, sql } from "drizzle-orm";

import { db } from "@/db";
import { contacts, deals } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";

export default async function DashboardPage() {
  const { orgId, orgSlug, orgRole } = await requireOrg();

  const [[contactsCount], [openDeals]] = await Promise.all([
    db.select({ n: count() }).from(contacts).where(eq(contacts.orgId, orgId)),
    db
      .select({ n: count(), total: sql<string>`coalesce(sum(${deals.amount}), 0)` })
      .from(deals)
      .where(and(eq(deals.orgId, orgId), eq(deals.status, "open"))),
  ]);

  const total = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(openDeals.total ?? 0));

  const kpis = [
    { label: "Contactos", value: String(contactsCount.n), href: "/contacts" },
    { label: "Deals abiertos", value: String(openDeals.n), href: "/pipeline" },
    { label: "Valor en pipeline", value: total, href: "/pipeline" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel</h1>
        <p className="text-sm text-ink-muted">
          Organización activa: <span className="font-mono">{orgSlug ?? orgId}</span> · rol{" "}
          {orgRole}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-lg border border-ink bg-white p-5 shadow-hard-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="text-sm text-ink-muted">{kpi.label}</div>
            <div className="mt-1 text-3xl font-bold tracking-tight">{kpi.value}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-lime-soft p-4 text-sm text-ink-soft">
        ⚡ Las métricas de <strong>tiempo a 1ª respuesta</strong> y speed-to-lead se llenan
        cuando conectas WhatsApp en la <Link href="/inbox" className="underline">Bandeja</Link>{" "}
        y el agente empieza a responder.
      </div>
    </div>
  );
}
