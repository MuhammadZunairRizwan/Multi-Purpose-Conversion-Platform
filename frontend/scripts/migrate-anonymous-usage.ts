import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrateAnonymousUsage() {
  console.log("Creating anonymous_usage table...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS anonymous_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address TEXT NOT NULL,
        date DATE NOT NULL,
        conversion_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create index for faster lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_anonymous_usage_ip_date
      ON anonymous_usage (ip_address, date)
    `);

    console.log("anonymous_usage table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
}

migrateAnonymousUsage()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
