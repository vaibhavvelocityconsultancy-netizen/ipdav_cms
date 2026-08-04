import { spawnSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PRISMA_DATABASE_URL;

if (!databaseUrl) {
  console.log("No PostgreSQL database URL is set; skipping Prisma migrations.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
