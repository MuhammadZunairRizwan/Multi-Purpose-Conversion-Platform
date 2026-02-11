import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function runMigration() {
  console.log("Running document_history migration...\n");

  try {
    // Create document_history table
    await sql`
      CREATE TABLE IF NOT EXISTS "document_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "clerk_id" text NOT NULL,
        "document_type" text NOT NULL,
        "document_id" text NOT NULL,
        "document_name" text NOT NULL,
        "tier" text DEFAULT 'FREE' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✓ document_history table created (or already exists)");

    // Add enum values if they don't exist
    try {
      await sql`ALTER TYPE "public"."document_type" ADD VALUE IF NOT EXISTS 'NDA'`;
      console.log("✓ Added NDA to document_type enum");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("✓ NDA already exists in document_type enum");
      } else {
        console.log("Note: Could not add NDA to enum (may not exist)");
      }
    }

    try {
      await sql`ALTER TYPE "public"."document_type" ADD VALUE IF NOT EXISTS 'EMPLOYMENT_LETTER'`;
      console.log("✓ Added EMPLOYMENT_LETTER to document_type enum");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("✓ EMPLOYMENT_LETTER already exists in document_type enum");
      } else {
        console.log("Note: Could not add EMPLOYMENT_LETTER to enum (may not exist)");
      }
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
