#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

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
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error("Usage: node scripts/run-migration.js <migration-file.sql>");
    process.exit(1);
  }

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

  // Resolve migration file path
  let filePath;
  if (path.isAbsolute(migrationFile)) {
    filePath = migrationFile;
  } else {
    // Try relative to migrations directory first
    const migDir = path.join(root, "server/db/migrations");
    filePath = path.join(migDir, migrationFile);
    if (!fs.existsSync(filePath)) {
      // Try relative to root
      filePath = path.join(root, migrationFile);
    }
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Migration file not found: ${filePath}`);
    await sql.end();
    process.exit(1);
  }

  const relativePath = path.relative(root, filePath);
  const sqlText = fs.readFileSync(filePath, "utf8");

  console.log(`Running migration: ${relativePath}`);
  try {
    await sql.unsafe(sqlText);
    console.log(`✔ Migration completed: ${relativePath}`);
  } catch (e) {
    console.error(`✖ Migration failed: ${relativePath}`);
    console.error(e.message);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
  console.log("Migration executed successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

