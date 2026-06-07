# Decisiones de arquitectura

## 2026-06-07 — Stack (revisión crítica "pensar como startup")

Objetivos que mandan: producto YA, costo mínimo, no depender 100% de nosotros (managed), no reinventar la rueda.

### D1 — Producto standalone multi-tenant
Repo nuevo, no módulo del PHP de RobotSchool ni parte de Metron. RobotSchool y Metron son tenants piloto. **Motivo:** escala, no acopla, eventualmente vendible.

### D2 — Full-stack TypeScript / Next.js (NO FastAPI/Python)
Un solo repo y lenguaje: Next.js 16 App Router + Server Actions + API routes.
**Motivo:** nada del CRM (CRUD + webhooks + llamadas a Claude) necesita Python; un stack, un deploy en Vercel, menos ops. Es el mismo stack del 30X-sandbox ya en producción.
**Descartado:** el scaffold FastAPI inicial (2026-06-07, mismo día).

### D3 — Clerk para auth + multi-tenant (Organizations)
El `orgId` de Clerk **es** el tenant key. Usuarios y membresías viven en Clerk. NO hay tablas `org`/`user` propias; `ownerId`/`userId` son IDs de Clerk (text).
**Motivo:** Clerk Organizations da tenants, roles, invitaciones y switcher ya hechos → semanas ahorradas. Gratis ~10k MAU; los leads NO son usuarios Clerk.
**Implicación:** TODA query de negocio filtra por `orgId` vía `src/lib/tenant.ts#requireOrg()`. Nunca a mano por endpoint.
**Futuro:** si se necesita reporting sobre usuarios, espejar vía Clerk webhooks (`/api/webhooks/clerk`).

### D4 — Supabase (Postgres) + Drizzle ORM
Postgres gestionado por Supabase (+ Realtime para inbox en vivo, + RLS como defensa en profundidad del tenant). Drizzle ORM + Drizzle Kit para schema/migraciones.
**Conexión:** runtime usa el POOLER (6543, `prepare:false`); migraciones usan conexión DIRECTA (5432) vía `DIRECT_URL`.

### D5 — Inngest para webhooks durables y el agente
Webhooks de WhatsApp/IG y flujos del agente corren en Inngest (reintentos, durabilidad), no en funciones serverless crudas que pueden hacer timeout.
**Motivo:** el SLA <5 min exige no perder mensajes.

### D6 — IA: Vercel AI SDK + Claude
`@ai-sdk/anthropic`. `claude-haiku-4-5` para triage barato, `claude-opus-4-8` para respuestas complejas. Agente **human-in-the-loop** (auto-responde + asiste, humano confirma).

### D7 — Hosting: Vercel (app) + Supabase (DB), ambos managed
VPS Hostinger queda para el sandbox de Evolution API o workers always-on. Decisión reversible (Next.js corre en cualquier lado).

### D8 — Canales detrás de `ChannelProvider`
Adapters: `meta_cloud` (WhatsApp Cloud API directo de Meta, prod), `instagram`, `evolution` (sandbox no oficial). Futuro: `kapso`, `360dialog`. Nunca llamar a un proveedor directo desde una ruta.
