#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const postgres = require("postgres").default || require("postgres");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const content = fs.readFileSync(filePath, "utf8");
  content.split("\n").forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const [k, ...v] = t.split("=");
    if (k && v.length) out[k.trim()] = v.join("=").trim();
  });
  return out;
}

function cleanValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return value.replace(/^['"]|['"]$/g, "");
}

async function main() {
  const root = path.join(__dirname, "..");
  const envPath = path.join(root, ".env");
  const env = loadEnv(envPath);

  const sslMode = cleanValue(
    env.PGSSLMODE,
    cleanValue(process.env.PGSSLMODE, "disable")
  );
  const channelBinding = cleanValue(
    env.PGCHANNELBINDING,
    cleanValue(process.env.PGCHANNELBINDING, "")
  );
  const user = cleanValue(env.PGUSER, process.env.PGUSER);
  const password = cleanValue(env.PGPASSWORD, process.env.PGPASSWORD);
  const host = cleanValue(env.PGHOST, process.env.PGHOST);
  const dbName = cleanValue(env.PGDATABASE, process.env.PGDATABASE);
  const portRaw =
    cleanValue(env.PGPORT, process.env.PGPORT) ||
    (process.env.PGPORT !== undefined ? process.env.PGPORT : undefined);
  const port = portRaw ? Number(portRaw) : 5432;

  if (!user || !password || !host || !dbName) {
    throw new Error(
      "Missing database credentials (PGUSER, PGPASSWORD, PGHOST, PGDATABASE)"
    );
  }

  const conn = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port}/${dbName}?sslmode=${sslMode}${channelBinding ? `&channel_binding=${channelBinding}` : ""}`;
  const sql = postgres(conn, { max: 1 });

  const seedFile = path.join(root, "server/db/migrations/0101_seed_location_data.sql");
  
  if (!fs.existsSync(seedFile)) {
    console.error(`Seed file not found: ${seedFile}`);
    process.exit(1);
  }

  const sqlText = fs.readFileSync(seedFile, "utf8");
  console.log(`Seeding location data: 0101_seed_location_data.sql`);
  
  try {
    await sql.unsafe(sqlText);
    console.log(`✔ Done: Location seed data inserted successfully`);
  } catch (e) {
    console.error(`✖ Failed: ${e.message}`);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
  console.log("Location seed completed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

