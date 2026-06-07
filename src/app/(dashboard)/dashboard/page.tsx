import { requireOrg } from "@/lib/tenant";

export default async function DashboardPage() {
  const { orgId, orgSlug, orgRole } = await requireOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="text-sm text-zinc-500">
          Organización activa: <span className="font-mono">{orgSlug ?? orgId}</span>{" "}
          · rol {orgRole}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Leads sin responder", value: "—" },
          { label: "Tiempo a 1ª respuesta", value: "—" },
          { label: "Deals abiertos", value: "—" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-zinc-200 p-4"
          >
            <div className="text-sm text-zinc-500">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-zinc-400">
        F1 en construcción: contactos, pipeline kanban y timeline. Las métricas se
        activan con la bandeja omnicanal (F2) y el agente reactivo (F3).
      </p>
    </div>
  );
}
