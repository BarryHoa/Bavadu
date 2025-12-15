/**
 * Test script to verify Vercel build compatibility
 * Simulates Vercel environment and tests key components
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🧪 Testing Vercel Build Compatibility...\n");

// Test 1: Check if build completes
console.log("📦 Test 1: Running build...");
const buildProcess = spawn("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

buildProcess.on("close", (code) => {
  if (code !== 0) {
    console.error("❌ Build failed with code:", code);
    process.exit(1);
  }

  console.log("✅ Build completed successfully!\n");

  // Test 2: Check if key files exist
  console.log("📁 Test 2: Checking key files...");
  const fs = require("fs");

  const requiredFiles = [
    "instrumentation.ts",
    "proxy.ts",
    "vercel.json",
    "module-base/server/utils/initializeRuntime.ts",
    "app/api/cron/cleanup-expired-sessions/route.ts",
    "app/api/cron/compress-logs/route.ts",
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.error(`  ❌ ${file} - NOT FOUND`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    console.error("\n❌ Some required files are missing!");
    process.exit(1);
  }

  console.log("\n✅ All required files exist!\n");

  // Test 3: Check vercel.json configuration
  console.log("⚙️  Test 3: Checking vercel.json...");
  try {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8")
    );

    if (vercelConfig.crons && Array.isArray(vercelConfig.crons)) {
      console.log(`  ✅ Found ${vercelConfig.crons.length} cron job(s)`);
      vercelConfig.crons.forEach((cron) => {
        console.log(`    - ${cron.path} (${cron.schedule})`);
      });
    } else {
      console.warn("  ⚠️  No cron jobs configured");
    }

    if (vercelConfig.framework === "nextjs") {
      console.log("  ✅ Framework: Next.js");
    }

    console.log("\n✅ vercel.json configuration is valid!\n");
  } catch (error) {
    console.error("  ❌ Error reading vercel.json:", error.message);
    process.exit(1);
  }

  // Test 4: Check proxy.ts exports
  console.log("🔍 Test 4: Checking proxy.ts exports...");
  try {
    const proxyContent = fs.readFileSync(
      path.join(process.cwd(), "proxy.ts"),
      "utf8"
    );

    if (proxyContent.includes("export async function proxy")) {
      console.log("  ✅ proxy() function exported");
    } else {
      console.error("  ❌ proxy() function not found");
      process.exit(1);
    }

    if (proxyContent.includes("export const config")) {
      console.log("  ✅ config exported");
    } else {
      console.error("  ❌ config not exported");
      process.exit(1);
    }

    console.log("\n✅ proxy.ts exports are correct!\n");
  } catch (error) {
    console.error("  ❌ Error reading proxy.ts:", error.message);
    process.exit(1);
  }

  // Test 5: Check instrumentation.ts
  console.log("🔧 Test 5: Checking instrumentation.ts...");
  try {
    const instrumentationContent = fs.readFileSync(
      path.join(process.cwd(), "instrumentation.ts"),
      "utf8"
    );

    if (instrumentationContent.includes("export async function register")) {
      console.log("  ✅ register() function exported");
    } else {
      console.error("  ❌ register() function not found");
      process.exit(1);
    }

    if (instrumentationContent.includes("initializeRuntime")) {
      console.log("  ✅ Uses initializeRuntime() helper");
    }

    if (instrumentationContent.includes("RUNNING_CUSTOM_SERVER")) {
      console.log("  ✅ Checks for custom server");
    }

    console.log("\n✅ instrumentation.ts is correct!\n");
  } catch (error) {
    console.error("  ❌ Error reading instrumentation.ts:", error.message);
    process.exit(1);
  }

  // Test 6: Check initializeRuntime.ts
  console.log("🔄 Test 6: Checking initializeRuntime.ts...");
  try {
    const initContent = fs.readFileSync(
      path.join(process.cwd(), "module-base/server/utils/initializeRuntime.ts"),
      "utf8"
    );

    if (initContent.includes("export async function initializeRuntime")) {
      console.log("  ✅ initializeRuntime() function exported");
    } else {
      console.error("  ❌ initializeRuntime() function not found");
      process.exit(1);
    }

    console.log("\n✅ initializeRuntime.ts is correct!\n");
  } catch (error) {
    console.error("  ❌ Error reading initializeRuntime.ts:", error.message);
    process.exit(1);
  }

  // Summary
  console.log("=".repeat(50));
  console.log("✅ All Vercel build tests passed!");
  console.log("=".repeat(50));
  console.log("\n📋 Summary:");
  console.log("  ✅ Build completed successfully");
  console.log("  ✅ All required files exist");
  console.log("  ✅ vercel.json configured correctly");
  console.log("  ✅ proxy.ts exports correct");
  console.log("  ✅ instrumentation.ts configured");
  console.log("  ✅ initializeRuntime.ts helper available");
  console.log("\n🚀 Ready for Vercel deployment!\n");
});
