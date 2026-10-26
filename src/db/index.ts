import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "~/config/env";

export const db = drizzle({ connection: { url: env.DATABASE_URL, connectionTimeout: 5 } });
