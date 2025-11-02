#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Get command line arguments
const args = process.argv.slice(2);
const environment = args[0] || "local"; // Default to local if no argument provided

// Define environment file mappings
const envFiles = {
  local: "envs/env.local",
  production: "envs/env.prod",
};

// Get the source environment file
const sourceFile = envFiles[environment];

if (!sourceFile) {
  console.error(`❌ Unknown environment: ${environment}`);
  console.log("Available environments: local, production");
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
    `🚀 Starting development server with ${environment} environment...`
  );

  // Start the Next.js development server
  const nextDev = spawn("bun", ["run", "next"], {
    stdio: "inherit",
    shell: true,
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping development server...");
    nextDev.kill("SIGINT");
    process.exit(0);
  });

  nextDev.on("close", (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
} catch (error) {
  console.error(`❌ Error copying environment file: ${error.message}`);
  process.exit(1);
}
