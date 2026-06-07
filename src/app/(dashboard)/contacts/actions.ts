"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, contacts } from "@/db/schema";
import { requireOrg } from "@/lib/tenant";

function field(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v.length ? v : null;
}

export async function createContact(formData: FormData) {
  const { orgId, userId } = await requireOrg();
  const fullName = field(formData, "fullName");
  if (!fullName) throw new Error("El nombre es obligatorio");

  await db.insert(contacts).values({
    orgId,
    ownerId: userId,
    fullName,
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    whatsapp: field(formData, "whatsapp"),
    instagram: field(formData, "instagram"),
    source: field(formData, "source"),
    notes: field(formData, "notes"),
  });

  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function addActivity(formData: FormData) {
  const { orgId, userId } = await requireOrg();
  const contactId = field(formData, "contactId");
  const body = field(formData, "body");
  if (!contactId || !body) throw new Error("Falta contacto o contenido");

  // Verificar que el contacto es de esta org antes de adjuntar actividad.
  const owned = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.orgId, orgId)))
    .limit(1);
  if (!owned.length) throw new Error("Contacto no encontrado");

  await db.insert(activities).values({
    orgId,
    type: "note",
    contactId,
    userId,
    body,
  });

  revalidatePath(`/contacts/${contactId}`);
}
