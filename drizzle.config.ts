import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Para migraciones usar la conexión DIRECTA (puerto 5432), no el pooler.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
