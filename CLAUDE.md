# CLAUDE.md — CRM Omnicanal

CRM propio standalone multi-tenant. Captura omnicanal (WhatsApp/IG/web), agente reactivo IA <5 min, lead scoring, pipeline, reporting. Tenants piloto: RobotSchool y Metron.

> Guía base de Next.js generada en `@AGENTS.md`. Esta guía manda sobre las reglas del producto.

## Stack
Next.js 16 (App Router + Server Actions) · TypeScript · **Clerk** (auth + Organizations) · **Supabase** Postgres + **Drizzle ORM** · **Inngest** (webhooks/jobs durables) · **Vercel AI SDK** + `@ai-sdk/anthropic` · Tailwind v4 · deploy Vercel.

## Reglas de oro
1. **Multi-tenant:** el tenant es el `orgId` de Clerk. NO hay tablas org/user propias. TODA query/acción de negocio empieza por `requireOrg()` (`src/lib/tenant.ts`) y filtra por `orgId`. Nunca confiar en un `orgId` que venga del cliente.
2. **Schema:** Drizzle en `src/db/schema.ts`. Cambios → `npm run db:push` (dev) o `db:generate` + `db:migrate` (prod). Toda tabla de negocio lleva `orgId: text`.
3. **DB runtime** usa el pooler de Supabase (`prepare:false`); migraciones usan `DIRECT_URL`.
4. **Canales** detrás de `ChannelProvider` (F2). Nunca llamar a Meta/Evolution directo desde una ruta.
5. **IA:** Claude vía AI SDK. `claude-haiku-4-5` triage, `claude-opus-4-8` complejo. Agente human-in-the-loop.
6. **Webhooks** entrantes son rutas públicas (`/api/webhooks/*`, ver middleware) y se autentican por firma, no por sesión.

## Layout
```
src/app/(dashboard)/   # panel protegido (layout con OrganizationSwitcher + UserButton)
src/app/sign-in, sign-up
src/app/api/           # route handlers + webhooks (pendiente)
src/db/                # schema.ts + index.ts (cliente drizzle)
src/lib/tenant.ts      # requireOrg() — punto único de tenant
src/middleware.ts      # Clerk: protege todo salvo rutas públicas
```

## Estado: base F1 (schema, auth Clerk, shell del panel). Faltan CRUD contactos/deals, kanban, timeline, migraciones aplicadas.

Contexto de negocio y fases: vault `20 - Projects/Active/Producto - CRM Omnicanal.md`.
