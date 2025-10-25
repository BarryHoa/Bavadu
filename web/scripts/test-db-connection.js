#!/usr/bin/env node

const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

// Load environment variables
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Environment file not found: ${filePath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(filePath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return envVars;
}

// Test database connection
async function testConnection(envVars) {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = envVars;

  console.log("🔍 Testing PostgreSQL Database Connection");
  console.log("========================================");
  console.log(`Host: ${DB_HOST}`);
  console.log(`Port: ${DB_PORT}`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`User: ${DB_USER}`);
  console.log("");

  const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

  try {
    console.log("⏳ Connecting to database...");

    const sql = postgres(connectionString, {
      max: 1, // Use only 1 connection for testing
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Test basic connection
    const result =
      await sql`SELECT version() as version, current_database() as database, current_user as user`;

    console.log("✅ Database connection successful!");
    console.log("");
    console.log("📊 Connection Details:");
    console.log(`   Database: ${result[0].database}`);
    console.log(`   User: ${result[0].user}`);
    console.log(`   PostgreSQL Version: ${result[0].version}`);
    console.log("");

    // Test if our tables exist
    console.log("🔍 Checking for existing tables...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} table(s):`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log("ℹ️  No tables found in the database");
    }

    // Test users table specifically
    console.log("");
    console.log("🔍 Checking for users table...");
    const usersTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `;

    if (usersTable.length > 0) {
      console.log("✅ Users table exists");

      // Count users
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   Total users: ${userCount[0].count}`);
    } else {
      console.log("ℹ️  Users table does not exist yet");
      console.log(
        "   Run 'npm run db:generate' and 'npm run db:migrate' to create tables"
      );
    }

    await sql.end();
    console.log("");
    console.log("🎉 Database connection test completed successfully!");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("");
    console.error("Error details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || "N/A"}`);
    console.error("");

    // Provide troubleshooting suggestions
    console.log("🔧 Troubleshooting suggestions:");
    console.log("   1. Check if PostgreSQL is running");
    console.log("   2. Verify database credentials");
    console.log("   3. Ensure the database exists");
    console.log("   4. Check firewall/network settings");
    console.log("   5. Verify PostgreSQL is listening on the correct port");

    process.exit(1);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const envFile = args[0] || "envs/env.local";

  console.log(`📁 Loading environment from: ${envFile}`);
  console.log("");

  const envPath = path.join(__dirname, "..", envFile);
  const envVars = loadEnvFile(envPath);

  await testConnection(envVars);
}

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  process.exit(1);
});

// Run the test
main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
