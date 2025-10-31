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

async function main() {
  const root = path.join(__dirname, "..");
  const envPath = path.join(root, ".env");
  const env = loadEnv(envPath);

  const conn = `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}?sslmode=${env.PGSSLMODE || "disable"}`;
  const sql = postgres(conn, { max: 1 });

  const migDir = path.join(root, "server/db/migrations");
  const files = fs
    .readdirSync(migDir)
    .filter((f) => /^01\d{2}_seed_.*\.sql$/.test(f))
    .sort();

  if (files.length === 0) {
    console.log("No seed files found.");
    process.exit(0);
  }

  console.log(`Found ${files.length} seed files`);
  for (const f of files) {
    const full = path.join(migDir, f);
    const sqlText = fs.readFileSync(full, "utf8");
    console.log(`Seeding: ${f}`);
    try {
      await sql.unsafe(sqlText);
      console.log(`✔ Done: ${f}`);
    } catch (e) {
      console.error(`✖ Failed: ${f}`);
      console.error(e.message);
      await sql.end();
      process.exit(1);
    }
  }

  await sql.end();
  console.log("All seed files executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


