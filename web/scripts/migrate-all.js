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

function getAllFiles(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, pattern, fileList);
    } else if (pattern.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList.sort();
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

  const migDir = path.join(root, "server/db/migrations");
  
  // Tìm tất cả các file create_*.sql
  const migrationFiles = getAllFiles(migDir, /^create_.*\.sql$/);
  
  if (migrationFiles.length === 0) {
    console.log("No migration files found.");
    await sql.end();
    process.exit(0);
  }

  console.log(`Found ${migrationFiles.length} migration files`);
  for (const filePath of migrationFiles) {
    const relativePath = path.relative(migDir, filePath);
    const sqlText = fs.readFileSync(filePath, "utf8");
    console.log(`Migrating: ${relativePath}`);
    try {
      await sql.unsafe(sqlText);
      console.log(`✔ Done: ${relativePath}`);
    } catch (e) {
      // Bỏ qua lỗi nếu table/constraint/index đã tồn tại
      if (e.message && (
        e.message.includes('already exists') ||
        e.message.includes('duplicate key') ||
        e.code === '42P07' || // relation already exists
        e.code === '42710' || // duplicate object
        e.code === '23505'    // unique violation
      )) {
        console.log(`⚠ Skipped (already exists): ${relativePath}`);
      } else {
        console.error(`✖ Failed: ${relativePath}`);
        console.error(e.message);
        await sql.end();
        process.exit(1);
      }
    }
  }

  await sql.end();
  console.log("All migration files executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

