import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("Set DIRECT_URL or DATABASE_URL for the target database");
const client = new pg.Client({ connectionString });
try {
  const sql = await readFile(
    new URL("../../prisma/search-index.sql", import.meta.url),
    "utf8",
  );
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query(sql);
  await client.query("COMMIT");
  console.log(
    "Search columns and indexes are ready. Existing bookmarks were preserved.",
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(
    "Search schema update failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
