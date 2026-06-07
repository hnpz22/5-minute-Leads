import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Punto único de obtención del tenant. TODA acción/loader de negocio debe
 * empezar por aquí y filtrar sus queries por el `orgId` devuelto.
 * No hay tablas org/user propias: la identidad vive en Clerk Organizations.
 *
 * Si el usuario no tiene una organización ACTIVA, lo manda a /onboarding para
 * crear o seleccionar una (no lanza error: evita el loop de "crear org").
 */
export async function requireOrg() {
  const { userId, orgId, orgRole, orgSlug } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/onboarding");
  return { userId, orgId, orgRole, orgSlug };
}
