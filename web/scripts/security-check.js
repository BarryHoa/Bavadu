#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * Automated security scanning for dependencies and vulnerabilities
 * 
 * Usage:
 *   npm run security:check        - Run all security checks
 *   npm run security:audit         - Run npm audit
 *   npm run security:outdated      - Check for outdated packages
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, colors.cyan);
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: "pipe",
    });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.log(error.stderr);
    return { success: false, error: error.message };
  }
}

function checkPackageJson() {
  log("\n📦 Checking package.json...", colors.blue);
  const packagePath = path.join(process.cwd(), "package.json");
  
  if (!fs.existsSync(packagePath)) {
    log("❌ package.json not found", colors.red);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
  
  // Check for known vulnerable React versions
  const reactVersion = packageJson.dependencies?.react || packageJson.devDependencies?.react;
  if (reactVersion) {
    const version = reactVersion.replace(/[\^~]/, "");
    if (version.startsWith("19.0.0") || version.startsWith("19.1.0") || version.startsWith("19.2.0")) {
      log(`⚠️  React version ${version} may be vulnerable to CVE-2025-55182`, colors.yellow);
      log("   Please update to React 19.2.1 or later", colors.yellow);
    } else {
      log(`✅ React version: ${version}`, colors.green);
    }
  }

  return true;
}

function runNpmAudit() {
  log("\n🔍 Running npm audit...", colors.blue);
  return runCommand("npm audit --audit-level=moderate", "Security audit");
}

function checkOutdated() {
  log("\n📊 Checking for outdated packages...", colors.blue);
  return runCommand("npm outdated", "Outdated packages check");
}

function generateReport() {
  log("\n📝 Generating security report...", colors.blue);
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      packageJson: checkPackageJson(),
      audit: null,
      outdated: null,
    },
  };

  // Run npm audit
  const auditResult = runNpmAudit();
  report.checks.audit = auditResult.success;

  // Check outdated packages
  const outdatedResult = checkOutdated();
  report.checks.outdated = outdatedResult.success;

  // Save report
  const reportPath = path.join(process.cwd(), "security-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n✅ Security report saved to: ${reportPath}`, colors.green);

  return report;
}

// Main execution
const command = process.argv[2];

switch (command) {
  case "audit":
    runNpmAudit();
    break;
  case "outdated":
    checkOutdated();
    break;
  case "check":
  default:
    generateReport();
    break;
}

