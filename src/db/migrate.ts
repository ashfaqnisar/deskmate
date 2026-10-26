import { migrate } from "drizzle-orm/bun-sql/migrator";

import { db } from "~/db";

await migrate(db, { migrationsFolder: `${import.meta.dir}/migrations` });
await db.$client.close();
