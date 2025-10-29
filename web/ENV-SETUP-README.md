# Environment Setup Guide

This guide explains how to set up environment variables for the Bavadu Solution Admin project.

## Quick Setup

### 1. Automatic Setup
```bash
npm run env:setup
```

This will create both `.env` and `.env.example` files with default configuration.

### 2. Manual Setup
If you prefer to create the environment file manually:

```bash
# Copy the example file
cp env.local .env

# Or create from scratch
touch .env
```

## Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PGUSER` | PostgreSQL username | `postgres` | Yes |
| `PGPASSWORD` | PostgreSQL password | `password` | Yes |
| `PGHOST` | PostgreSQL host | `localhost` | Yes |
| `PGPORT` | PostgreSQL port | `5432` | Yes |
| `PGDATABASE` | Database name | `bava_db_local` | Yes |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-here` | Yes |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PGSSLMODE` | SSL mode for database | `disable` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `DEBUG` | Enable debug mode | `true` |
| `RATE_LIMIT_MAX` | Rate limit (requests/min) | `100` |

## Environment-Specific Configuration

### Development
- Database: `bava_db_local`
- Debug mode: Enabled
- CORS: Relaxed settings
- Logging: Detailed

### Production
- Database: `bava_db_production`
- Debug mode: Disabled
- CORS: Restricted origins
- Logging: Error only
- SSL: Required

## Security Best Practices

### 1. JWT Secret
```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Database Security
- Use strong passwords
- Enable SSL in production
- Use environment-specific databases
- Regular password rotation

### 3. CORS Configuration
```bash
# Development
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# Production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## Database Setup

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE bava_db_local;

-- Create user (optional)
CREATE USER bava_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bava_db_local TO bava_user;
```

### 3. Run Migrations
```bash
npm run db:generate
npm run db:migrate
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **JWT Errors**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings

3. **CORS Issues**
   - Update `CORS_ORIGIN` with correct URLs
   - Check for typos in URLs

4. **Environment File Not Found**
   - Run `npm run env:setup`
   - Check file exists in project root

### Debug Mode
Enable debug mode for detailed logging:
```bash
DEBUG=true npm run dev
```

## File Structure

```
web/
├── .env                 # Environment variables (ignored by git)
├── .env.example         # Environment template
├── env.local           # Local environment template
├── setup-env.js        # Environment setup script
└── ENV-SETUP-README.md # This file
```

## Next Steps

After setting up the environment:

1. **Update Database Credentials**
   ```bash
   # Edit .env file
   PGUSER=your_username
   PGPASSWORD=your_password
   PGDATABASE=your_database
   ```

2. **Generate JWT Secret**
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Database Migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Support

For environment-related issues:
- Check this README
- Review the console output
- Verify all required variables are set
- Ensure database is accessible
