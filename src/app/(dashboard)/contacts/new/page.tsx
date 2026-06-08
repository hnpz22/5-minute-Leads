import Link from "next/link";

import { createContact } from "../actions";

const inputCls =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none";

export default function NewContactPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/contacts" className="text-sm text-ink-muted hover:underline">
          ← Contactos
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Nuevo contacto</h1>
      </div>

      <form action={createContact} className="space-y-4 rounded-lg border border-line bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre *</label>
          <input name="fullName" required className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">WhatsApp</label>
            <input name="whatsapp" placeholder="+57…" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Instagram</label>
            <input name="instagram" placeholder="@usuario" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Teléfono</label>
            <input name="phone" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Origen</label>
          <select name="source" className={inputCls} defaultValue="">
            <option value="">—</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="web">Web</option>
            <option value="referral">Referido</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Notas</label>
          <textarea name="notes" rows={3} className={inputCls} />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-cream hover:opacity-90"
          >
            Guardar
          </button>
          <Link
            href="/contacts"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-cream-alt"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
