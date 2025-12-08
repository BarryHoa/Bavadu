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

  // Tìm tất cả các file seed_*.sql trong tất cả các thư mục con
  function getAllSeedFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllSeedFiles(filePath, fileList);
      } else if (/^seed_.*\.sql$/.test(file)) {
        fileList.push(filePath);
      }
    });
    return fileList.sort();
  }

  const files = getAllSeedFiles(migDir);

  if (files.length === 0) {
    console.log("No seed files found.");
    process.exit(0);
  }

  console.log(`Found ${files.length} seed files`);
  for (const filePath of files) {
    const relativePath = path.relative(migDir, filePath);
    const sqlText = fs.readFileSync(filePath, "utf8");
    console.log(`Seeding: ${relativePath}`);
    try {
      await sql.unsafe(sqlText);
      console.log(`✔ Done: ${relativePath}`);
    } catch (e) {
      // Bỏ qua lỗi nếu là duplicate key hoặc conflict
      if (
        e.message &&
        (e.message.includes("duplicate key") ||
          e.message.includes("already exists") ||
          e.code === "23505" || // unique violation
          e.code === "23503") // foreign key violation (có thể do data đã tồn tại)
      ) {
        console.log(`⚠ Skipped (duplicate/conflict): ${relativePath}`);
      } else {
        console.error(`✖ Failed: ${relativePath}`);
        console.error(e.message);
        await sql.end();
        process.exit(1);
      }
    }
  }

  await sql.end();
  console.log("All seed files executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
