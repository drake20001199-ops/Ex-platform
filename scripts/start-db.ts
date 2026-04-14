import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "fs";

const pg = new EmbeddedPostgres({
  databaseDir: "./data/db",
  user: "user",
  password: "password",
  port: 5432,
  persistent: true,
});

async function main() {
  const alreadyInitialised = existsSync("./data/db/PG_VERSION");

  if (!alreadyInitialised) {
    console.log("Initializing PostgreSQL for the first time...");
    await pg.initialise();
  }

  console.log("Starting PostgreSQL...");
  await pg.start();
  console.log("PostgreSQL running on port 5432");

  if (!alreadyInitialised) {
    await pg.createDatabase("exchange_platform");
    console.log("Database 'exchange_platform' created");
  }

  console.log("DB is ready. Press Ctrl+C to stop.");
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("\nStopping PostgreSQL...");
  await pg.stop();
  process.exit(0);
});
