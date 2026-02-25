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
    shell: false, // Don't use shell to have better control over process
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      // Tắt log verbose của @tailwindcss/postcss (chỉ log khi DEBUG truthy)
      DEBUG: process.env.DEBUG ?? "0",
    },
  });

  // Function to kill all bun processes
  const killBunProcesses = () => {
    try {
      if (process.platform !== "win32") {
        // On Unix/Linux, find and kill all bun processes related to server.ts
        const { execSync } = require("child_process");
        try {
          // Kill processes by finding them via command line
          execSync(`pkill -f "bun.*server.ts" || true`, { stdio: "ignore" });
          execSync(`pkill -f "bun run.*server.ts" || true`, { stdio: "ignore" });
        } catch (e) {
          // Ignore if no processes found
        }
      } else {
        // On Windows
        const { exec } = require("child_process");
        exec(`taskkill /F /IM bun.exe /T 2>nul || taskkill /F /IM node.exe /T 2>nul`, () => {});
      }
    } catch (err) {
      // Ignore errors
    }
  };

  // Handle process termination
  const cleanup = () => {
    console.log("\n🛑 Stopping server...");
    
    // First try graceful shutdown
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill("SIGTERM");
    }
    
    // Also kill bun processes directly
    if (useBun) {
      killBunProcesses();
    }
    
    // Force kill after timeout
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        console.log("Force killing server process...");
        serverProcess.kill("SIGKILL");
        if (useBun) {
          killBunProcesses();
        }
      }
      process.exit(0);
    }, 3000);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  serverProcess.on("close", (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
} catch (error) {
  console.error(`❌ Error setting up server: ${error.message}`);
  process.exit(1);
}
