import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  date,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Multi-tenant: `orgId` = ID de la organización de Clerk (Clerk Organizations es
 * el dueño de la identidad de tenant y usuarios). NO tenemos tablas org/user
 * propias: las referencias a usuario (`ownerId`, `userId`) son IDs de Clerk (text).
 * TODA query de negocio DEBE filtrar por `orgId` del request autenticado.
 */

export const dealStatus = pgEnum("deal_status", ["open", "won", "lost"]);
export const activityType = pgEnum("activity_type", [
  "note",
  "call",
  "email",
  "whatsapp",
  "instagram",
  "visit",
  "stage_change",
  "task",
]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    domain: text("domain"),
    industry: text("industry"),
    size: text("size"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("companies_org_idx").on(t.orgId)],
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    ownerId: text("owner_id"), // Clerk user id
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    instagram: text("instagram"),
    source: text("source"), // whatsapp | instagram | web | referral | ...
    score: integer("score").default(0).notNull(), // lead score (F3)
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("contacts_org_idx").on(t.orgId),
    index("contacts_whatsapp_idx").on(t.whatsapp),
    index("contacts_instagram_idx").on(t.instagram),
  ],
);

export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pipelines_org_idx").on(t.orgId)],
);

export const stages = pgTable(
  "stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    pipelineId: uuid("pipeline_id")
      .references(() => pipelines.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    order: integer("order").default(0).notNull(),
    probability: integer("probability").default(0).notNull(), // 0-100
    isWon: boolean("is_won").default(false).notNull(),
    isLost: boolean("is_lost").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("stages_pipeline_idx").on(t.pipelineId)],
);

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    pipelineId: uuid("pipeline_id")
      .references(() => pipelines.id, { onDelete: "restrict" })
      .notNull(),
    stageId: uuid("stage_id")
      .references(() => stages.id, { onDelete: "restrict" })
      .notNull(),
    ownerId: text("owner_id"), // Clerk user id
    title: text("title").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).default("0").notNull(),
    currency: text("currency").default("COP").notNull(),
    status: dealStatus("status").default("open").notNull(),
    expectedCloseDate: date("expected_close_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("deals_org_idx").on(t.orgId),
    index("deals_stage_idx").on(t.stageId),
    index("deals_status_idx").on(t.status),
  ],
);

// ─── F2: Bandeja omnicanal ──────────────────────────────────────────────
export const channelType = pgEnum("channel_type", ["whatsapp", "instagram"]);
export const messageDirection = pgEnum("message_direction", ["inbound", "outbound"]);

export const channels = pgTable(
  "channels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    type: channelType("type").notNull(),
    // WhatsApp: Phone Number ID · Instagram: IG account id
    externalId: text("external_id").notNull(),
    displayName: text("display_name"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("channels_org_idx").on(t.orgId),
    uniqueIndex("channels_type_external_idx").on(t.type, t.externalId),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    channelId: uuid("channel_id")
      .references(() => channels.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    // ID externo del chat (wa_id del cliente / IGSID)
    externalId: text("external_id").notNull(),
    status: text("status").default("open").notNull(), // open | snoozed | closed
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    // Speed-to-lead: cuándo escribió primero el lead y cuándo respondimos
    firstInboundAt: timestamp("first_inbound_at", { withTimezone: true }),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("conversations_org_idx").on(t.orgId),
    index("conversations_contact_idx").on(t.contactId),
    uniqueIndex("conversations_channel_external_idx").on(t.channelId, t.externalId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    direction: messageDirection("direction").notNull(),
    externalId: text("external_id"), // id del mensaje en WhatsApp/IG
    body: text("body"),
    // true si lo generó el agente IA (no un humano)
    fromAgent: boolean("from_agent").default(false).notNull(),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("messages_conversation_idx").on(t.conversationId),
    index("messages_org_idx").on(t.orgId),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    type: activityType("type").notNull(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    userId: text("user_id"), // Clerk user id
    body: text("body"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    // type == task
    dueAt: timestamp("due_at", { withTimezone: true }),
    done: boolean("done").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("activities_org_idx").on(t.orgId),
    index("activities_contact_idx").on(t.contactId),
    index("activities_deal_idx").on(t.dealId),
  ],
);
