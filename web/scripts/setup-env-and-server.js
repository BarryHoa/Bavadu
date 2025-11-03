#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Get command line arguments
const args = process.argv.slice(2);
const environment = args[0] || "local";
const mode = args[1] || "dev"; // "dev" or "prod"

// Define environment file mappings
const envFiles = {
  local: "envs/env.local",
  prod: "envs/env.prod",
};

// Get the source environment file
const sourceFile = envFiles[environment];

if (!sourceFile) {
  console.error(`❌ Unknown environment: ${environment}`);
  console.log("Available environments: local, production, staging, test");
  process.exit(1);
}

const sourcePath = path.join(__dirname, "..", sourceFile);
const targetPath = path.join(__dirname, "..", ".env");

// Check if source file exists
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Environment file not found: ${sourcePath}`);
  console.log(
    "Please make sure the environment file exists in the envs directory"
  );
  process.exit(1);
}

try {
  // Copy the environment file
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Copied ${sourceFile} to .env`);
  console.log(
    `🚀 Starting ${mode === "dev" ? "development" : "production"} server with ${environment} environment...`
  );

  // Start the custom server with bun (or tsx if bun not available)
  const isBun = require("child_process")
    .execSync("which bun", { encoding: "utf-8", stdio: "pipe" })
    .trim();

  const useBun = isBun && isBun.length > 0;
  const command = useBun ? "bun" : "tsx";
  const args = ["./server.ts"]; // Run once in all modes (no watch)

  console.log(`Using ${command} to run server...`);

  const serverProcess = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    cwd: path.join(__dirname, ".."),
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping server...");
    serverProcess.kill("SIGINT");
    process.exit(0);
  });

  serverProcess.on("close", (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
} catch (error) {
  console.error(`❌ Error setting up server: ${error.message}`);
  process.exit(1);
}
