#!/usr/bin/env node

const bcrypt = require("bcryptjs");
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

  // User to update
  const userEmail = "user1@example.com";
  const newPassword = "12345678";

  try {
    console.log(`Updating password for user: ${userEmail}`);

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log("Password hashed successfully");

    // Update user_login table
    const result = await sql`
      UPDATE users_login
      SET 
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE email = ${userEmail}
      RETURNING user_id, username, email
    `;

    if (result.length === 0) {
      console.error(`❌ User with email ${userEmail} not found`);
      await sql.end();
      process.exit(1);
    }

    console.log(`✅ Password updated successfully for user:`);
    console.log(`   User ID: ${result[0].user_id}`);
    console.log(`   Username: ${result[0].username || "N/A"}`);
    console.log(`   Email: ${result[0].email}`);
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

