import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { pipelines, stages } from "@/db/schema";

const DEFAULT_STAGES = [
  { name: "Prospecto", probability: 10 },
  { name: "Calificado", probability: 25 },
  { name: "Demo / Reunión", probability: 40 },
  { name: "Propuesta", probability: 60 },
  { name: "Negociación", probability: 80 },
  { name: "Ganado", probability: 100, isWon: true },
  { name: "Perdido", probability: 0, isLost: true },
];

/**
 * Devuelve el pipeline por defecto de la org, creándolo (con sus stages) la
 * primera vez. Idempotente por la verificación previa.
 */
export async function ensureDefaultPipeline(orgId: string) {
  const existing = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.orgId, orgId))
    .limit(1);
  if (existing.length) return existing[0];

  const [pipeline] = await db
    .insert(pipelines)
    .values({ orgId, name: "Pipeline de ventas", isDefault: true })
    .returning();

  await db.insert(stages).values(
    DEFAULT_STAGES.map((s, i) => ({
      orgId,
      pipelineId: pipeline.id,
      name: s.name,
      order: i,
      probability: s.probability,
      isWon: s.isWon ?? false,
      isLost: s.isLost ?? false,
    })),
  );

  return pipeline;
}

export async function getPipelineWithStages(orgId: string) {
  const pipeline = await ensureDefaultPipeline(orgId);
  const stageRows = await db
    .select()
    .from(stages)
    .where(eq(stages.pipelineId, pipeline.id))
    .orderBy(asc(stages.order));
  return { pipeline, stages: stageRows };
}
