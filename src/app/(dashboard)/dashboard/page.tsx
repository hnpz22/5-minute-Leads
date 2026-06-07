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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="text-sm text-zinc-500">
          Organización activa: <span className="font-mono">{orgSlug ?? orgId}</span> · rol{" "}
          {orgRole}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-400"
          >
            <div className="text-sm text-zinc-500">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-zinc-400">
        Las métricas de tiempo a 1ª respuesta y speed-to-lead se activan con la bandeja
        omnicanal (F2) y el agente reactivo (F3).
      </p>
    </div>
  );
}
