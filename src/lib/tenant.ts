import { auth } from "@clerk/nextjs/server";

/**
 * Punto único de obtención del tenant. TODA acción/loader de negocio debe
 * empezar por aquí y filtrar sus queries por el `orgId` devuelto.
 * No hay tablas org/user propias: la identidad vive en Clerk Organizations.
 */
export async function requireOrg() {
  const { userId, orgId, orgRole, orgSlug } = await auth();
  if (!userId) throw new Error("No autenticado");
  if (!orgId) {
    throw new Error(
      "Sin organización activa: el usuario debe seleccionar/crear una org en Clerk.",
    );
  }
  return { userId, orgId, orgRole, orgSlug };
}
