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

  // Get all SQL files in order
  function getAllMigrationFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllMigrationFiles(filePath, fileList);
      } else if (file.endsWith(".sql") && !file.startsWith("seed_")) {
        fileList.push(filePath);
      }
    });
    return fileList.sort();
  }

  const files = getAllMigrationFiles(migDir);

  // Sort files: schemas first, then base, then modules
  files.sort((a, b) => {
    const aRel = path.relative(migDir, a);
    const bRel = path.relative(migDir, b);
    
    // Schemas first
    if (aRel.startsWith("0001_")) return -1;
    if (bRel.startsWith("0001_")) return 1;
    
    // Base before modules
    if (aRel.startsWith("base/") && !bRel.startsWith("base/")) return -1;
    if (!aRel.startsWith("base/") && bRel.startsWith("base/")) return 1;
    
    // Within base, ensure dependencies: countries before administrative_units
    if (aRel.includes("create_location_countries") && bRel.includes("create_location_administrative_units")) return -1;
    if (bRel.includes("create_location_countries") && aRel.includes("create_location_administrative_units")) return 1;
    
    // Then alphabetical
    return aRel.localeCompare(bRel);
  });

  if (files.length === 0) {
    console.log("No migration files found.");
    await sql.end();
    process.exit(0);
  }

  console.log(`Found ${files.length} migration files\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const filePath of files) {
    const relativePath = path.relative(root, filePath);
    const sqlText = fs.readFileSync(filePath, "utf8");
    
    console.log(`Running: ${relativePath}`);
    try {
      await sql.unsafe(sqlText);
      console.log(`✔ Success: ${relativePath}\n`);
      successCount++;
    } catch (e) {
      // Skip if table/constraint/index already exists
      if (
        e.message &&
        (e.message.includes("already exists") ||
          e.message.includes("duplicate key") ||
          e.message.includes("relation") && e.message.includes("already exists") ||
          e.message.includes("does not exist") && (e.message.includes("relation") || e.message.includes("function")) ||
          e.code === "42P07" || // duplicate_table
          e.code === "42710" || // duplicate_object
          e.code === "23505" || // unique_violation
          e.code === "23503" || // foreign_key_violation
          e.code === "42P01" || // undefined_table
          e.code === "42883") // undefined_function
      ) {
        // Check if it's a "does not exist" error that we should skip
        if (e.message && e.message.includes("does not exist")) {
          // For alter_description, skip if function doesn't exist (column might already be text)
          if (relativePath.includes("alter_description")) {
            console.log(`⚠ Skipped (column may already be text): ${relativePath}\n`);
            skipCount++;
            continue;
          }
          // For other cases, log as error but continue
          console.error(`✖ Failed (dependency missing): ${relativePath}`);
          console.error(`  Error: ${e.message}\n`);
          errorCount++;
          continue;
        }
        console.log(`⚠ Skipped (already exists): ${relativePath}\n`);
        skipCount++;
      } else {
        console.error(`✖ Failed: ${relativePath}`);
        console.error(`  Error: ${e.message}\n`);
        errorCount++;
        // Continue with other migrations
      }
    }
  }

  await sql.end();

  console.log("\n=== Migration Summary ===");
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠ Skipped: ${skipCount}`);
  console.log(`✖ Errors: ${errorCount}`);
  console.log(`Total: ${files.length}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

