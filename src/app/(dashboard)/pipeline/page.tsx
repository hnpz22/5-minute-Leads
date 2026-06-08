import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { contacts, deals } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { getPipelineWithStages } from "@/lib/pipeline";
import { createDeal, moveDeal } from "./actions";

function money(amount: string, currency: string) {
  const n = Number(amount);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

const inputCls =
  "rounded-md border border-line bg-white px-3 py-1.5 text-sm focus:border-ink focus:outline-none";

export default async function PipelinePage() {
  const { orgId } = await requireOrg();
  const { stages } = await getPipelineWithStages(orgId);

  const dealRows = await db
    .select()
    .from(deals)
    .where(eq(deals.orgId, orgId))
    .orderBy(desc(deals.createdAt));

  const contactRows = await db
    .select({ id: contacts.id, fullName: contacts.fullName })
    .from(contacts)
    .where(eq(contacts.orgId, orgId));
  const contactName = new Map(contactRows.map((c) => [c.id, c.fullName]));

  const byStage = new Map<string, typeof dealRows>();
  for (const s of stages) byStage.set(s.id, []);
  for (const d of dealRows) byStage.get(d.stageId)?.push(d);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>

      <form
        action={createDeal}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-line bg-white p-3"
      >
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Título</label>
          <input name="title" required placeholder="Oportunidad…" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Monto (COP)</label>
          <input name="amount" inputMode="numeric" placeholder="0" className={`${inputCls} w-32`} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Contacto</label>
          <select name="contactId" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {contactRows.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-cream hover:opacity-90">
          + Deal
        </button>
      </form>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage, i) => {
          const list = byStage.get(stage.id) ?? [];
          const total = list.reduce((sum, d) => sum + Number(d.amount), 0);
          const prev = stages[i - 1];
          const next = stages[i + 1];
          return (
            <div key={stage.id} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {stage.isWon && <span className="h-2 w-2 rounded-full bg-lime-deep" />}
                  {stage.name}
                </span>
                <span className="text-xs text-ink-faint">
                  {list.length} · {money(String(total), "COP")}
                </span>
              </div>
              <div className="space-y-2 rounded-lg bg-cream-alt p-2">
                {list.length === 0 && (
                  <p className="px-1 py-2 text-xs text-ink-faint">—</p>
                )}
                {list.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-md border border-line bg-white p-3 text-sm shadow-hard-sm"
                  >
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-ink-muted">
                      {money(d.amount, d.currency)}
                      {d.contactId && contactName.get(d.contactId)
                        ? ` · ${contactName.get(d.contactId)}`
                        : ""}
                    </div>
                    <div className="mt-2 flex justify-between">
                      {prev ? (
                        <form action={moveDeal}>
                          <input type="hidden" name="dealId" value={d.id} />
                          <input type="hidden" name="targetStageId" value={prev.id} />
                          <button className="text-xs text-ink-faint hover:text-ink" title={`Mover a ${prev.name}`}>
                            ←
                          </button>
                        </form>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <form action={moveDeal}>
                          <input type="hidden" name="dealId" value={d.id} />
                          <input type="hidden" name="targetStageId" value={next.id} />
                          <button className="text-xs text-ink-faint hover:text-ink" title={`Mover a ${next.name}`}>
                            {next.name} →
                          </button>
                        </form>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
