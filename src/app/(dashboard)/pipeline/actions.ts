"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { deals, stages } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";
import { ensureDefaultPipeline } from "@/lib/pipeline";

export async function createDeal(formData: FormData) {
  const { orgId, userId } = await requireOrg();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("El título es obligatorio");

  const amount = String(formData.get("amount") ?? "0").replace(/[^0-9.]/g, "") || "0";
  const contactId = String(formData.get("contactId") ?? "").trim() || null;

  const pipeline = await ensureDefaultPipeline(orgId);
  const [firstStage] = await db
    .select()
    .from(stages)
    .where(eq(stages.pipelineId, pipeline.id))
    .orderBy(asc(stages.order))
    .limit(1);

  await db.insert(deals).values({
    orgId,
    pipelineId: pipeline.id,
    stageId: firstStage.id,
    contactId,
    ownerId: userId,
    title,
    amount,
  });

  revalidatePath("/pipeline");
}

export async function moveDeal(formData: FormData) {
  const { orgId } = await requireOrg();
  const dealId = String(formData.get("dealId") ?? "");
  const targetStageId = String(formData.get("targetStageId") ?? "");
  if (!dealId || !targetStageId) throw new Error("Faltan datos");

  // El stage destino debe ser de la misma org.
  const [stage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.id, targetStageId), eq(stages.orgId, orgId)))
    .limit(1);
  if (!stage) throw new Error("Stage no válido");

  const status = stage.isWon ? "won" : stage.isLost ? "lost" : "open";

  await db
    .update(deals)
    .set({ stageId: targetStageId, status, updatedAt: new Date() })
    .where(and(eq(deals.id, dealId), eq(deals.orgId, orgId)));

  revalidatePath("/pipeline");
}
