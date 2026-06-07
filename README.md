# 5-minute Leads

CRM omnicanal propio, **standalone y multi-tenant**: captura omnicanal (WhatsApp + Instagram + web), respuesta reactiva en <5 min con asistencia de IA, lead scoring, pipeline/funnel y reporting.

Tenants piloto: **RobotSchool** y **Metron**.

## Stack (full-stack TypeScript, managed-first)

| Capa | Tecnología |
|------|-----------|
| App | **Next.js 16** (App Router, Server Actions) + TypeScript |
| Auth + multi-tenant | **Clerk** (Organizations) — el `orgId` de Clerk es el tenant key |
| Base de datos | **Supabase** (Postgres + Realtime + RLS) vía **Drizzle ORM** |
| Webhooks / jobs durables | **Inngest** (reintentos, agente reactivo) |
| IA | **Vercel AI SDK** + `@ai-sdk/anthropic` (Claude haiku/opus) |
| UI | Tailwind v4 (shadcn/ui pendiente) |
| Hosting | **Vercel** (app) + **Supabase** (DB) |

No hay tablas `org`/`user` propias: la identidad de tenant y usuarios vive en Clerk. Toda tabla de negocio lleva `orgId` (Clerk) y se filtra por él vía `requireOrg()`.

## Roadmap por fases

| Fase | Entrega |
|------|---------|
| **F1** | Núcleo CRM: contacts, companies, pipelines, stages, deals, activities + auth Clerk + kanban + timeline |
| **F2** | Bandeja omnicanal: `ChannelProvider` (meta_cloud / instagram / evolution) + webhooks vía Inngest + SLA/speed-to-lead (Realtime) |
| **F3** | Agente reactivo IA: triage, auto-respuesta (human-in-the-loop), lead scoring por reglas |
| **F4** | Automatización (secuencias) + reporting (embudo, conversion, velocity, forecast, BANT) |

## Desarrollo

```bash
cp .env.local.example .env.local     # rellenar Clerk + Supabase + Anthropic
npm install
npm run db:push                      # crea el schema en Supabase (drizzle-kit)
npm run dev                          # http://localhost:3000
```

Estado actual: **base F1** — schema de datos, auth Clerk (sign-in/up, orgs), shell del panel. Falta: CRUD de contactos/deals, kanban, timeline, migraciones aplicadas.

> Decisiones de diseño en `DECISIONS.md`. Contexto de negocio y fases en el vault: `20 - Projects/Active/Producto - CRM Omnicanal.md`.
