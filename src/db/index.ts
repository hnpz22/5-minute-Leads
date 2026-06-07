import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}

// Supabase: usar la connection string del POOLER (puerto 6543, modo transaction).
// `prepare: false` es obligatorio con pgbouncer en modo transaction.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
