#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Environment template
const envTemplate = `# ===========================================
# BAVADU SOLUTION ADMIN - ENVIRONMENT CONFIG
# ===========================================

# Environment
NODE_ENV=development

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# PostgreSQL Database Connection
PGUSER=postgres
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=bava_db_local
PGSSLMODE=disable

# ===========================================
# AUTHENTICATION & SECURITY
# ===========================================
# JWT Secret Key (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ===========================================
# APPLICATION SETTINGS
# ===========================================
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ===========================================
# CORS CONFIGURATION
# ===========================================
# Allowed origins for CORS (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# ===========================================
# LOGGING & DEBUG
# ===========================================
# Enable debug mode
DEBUG=true
LOG_LEVEL=debug

# ===========================================
# RATE LIMITING
# ===========================================
# Rate limiting settings (requests per minute)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# ===========================================
# FILE UPLOAD
# ===========================================
# Maximum file size (in bytes)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# ===========================================
# EMAIL CONFIGURATION (Optional)
# ===========================================
# SMTP Settings for email notifications
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@bavadu.com

# ===========================================
# EXTERNAL SERVICES (Optional)
# ===========================================
# Redis for caching (optional)
# REDIS_URL=redis://localhost:6379

# ===========================================
# DEVELOPMENT TOOLS
# ===========================================
# Enable API documentation
ENABLE_SWAGGER=true

# Enable database query logging
DB_LOGGING=true

# ===========================================
# MODULE SYSTEM
# ===========================================
# Module base path
MODULE_BASE_PATH=./modules

# ===========================================
# NOTES
# ===========================================
# 1. Change JWT_SECRET to a strong, unique value in production
# 2. Update database credentials for your environment
# 3. Set appropriate CORS origins for your domain
# 4. Enable SSL/TLS for production database connections
# 5. Use environment-specific values for different deployments`;

function setupEnvironment() {
  const envPath = path.join(__dirname, ".env");
  const envExamplePath = path.join(__dirname, ".env.example");

  console.log("🔧 Setting up environment configuration...");

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists!");
    console.log("   If you want to recreate it, please delete the existing file first.");
    return;
  }

  try {
    // Create .env file
    fs.writeFileSync(envPath, envTemplate);
    console.log("✅ Created .env file");

    // Create .env.example file
    fs.writeFileSync(envExamplePath, envTemplate);
    console.log("✅ Created .env.example file");

    console.log("\n📝 Next steps:");
    console.log("1. Update the database credentials in .env");
    console.log("2. Change JWT_SECRET to a strong, unique value");
    console.log("3. Adjust other settings as needed");
    console.log("4. Run 'npm run dev' to start the development server");

  } catch (error) {
    console.error("❌ Error creating environment files:", error.message);
    process.exit(1);
  }
}

// Run setup
setupEnvironment();
