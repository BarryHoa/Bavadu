# Development Workflow

This document describes the automated development workflow with environment management.

## Quick Start

### Basic Development

```bash
# Start development server with local environment (default)
bun run dev

# Start development server with local environment (explicit)
bun run dev local
```

### Environment-Specific Development

```bash
# Production environment
bun run dev prod

# Staging environment
bun run dev staging

# Test environment
bun run dev test
```

## How It Works

### Automatic Environment File Copying

When you run `bun run dev`, the system automatically:

1. **Copies the appropriate environment file** from `envs/` to `.env`
2. **Starts the Next.js development server** with the correct environment
3. **Handles process termination** gracefully

### Environment File Mapping

- `bun run dev` → copies `envs/env.local` to `.env`
- `bun run dev prod` → copies `envs/env.prod` to `.env`
- `bun run dev staging` → copies `envs/env.staging` to `.env`
- `bun run dev test` → copies `envs/env.test` to `.env`

### Available Commands

| Command               | Environment | Description                |
| --------------------- | ----------- | -------------------------- |
| `bun run dev`         | local       | Default local development  |
| `bun run dev local`   | local       | Explicit local development |
| `bun run dev prod`    | production  | Production environment     |
| `bun run dev staging` | staging     | Staging environment        |
| `bun run dev test`    | test        | Test environment           |

### Alternative Commands

You can also use the explicit commands:

```bash
bun run dev:local     # Local development
bun run dev:prod      # Production environment
bun run dev:staging   # Staging environment
bun run dev:test      # Test environment
```

## Environment Files

### Local Development (`envs/env.local`)

- Database: `bava_db_local`
- URL: `http://localhost:3000`
- Debug mode: enabled
- Logging: debug level

### Production (`envs/env.prod`)

- Database: `bava_db_production`
- URL: `https://your-production-domain.com`
- Debug mode: disabled
- Logging: error level
- Enhanced security settings

### Staging (`envs/env.staging`)

- Database: `bava_db_staging`
- URL: `https://your-staging-domain.com`
- Debug mode: enabled
- Logging: info level

### Test (`envs/env.test`)

- Database: `bava_db_test`
- URL: `http://localhost:3000`
- Debug mode: disabled
- Logging: error level
- Short JWT expiration

## Features

### Automatic Environment Detection

The system automatically detects the environment based on the command argument and copies the appropriate file.

### Error Handling

- Validates environment file existence
- Provides clear error messages
- Graceful process termination

### Process Management

- Proper signal handling (SIGINT)
- Clean shutdown on Ctrl+C
- Process exit code propagation

## Troubleshooting

### Common Issues

1. **Environment file not found**

   ```
   ❌ Environment file not found: envs/env.prod
   ```

   **Solution**: Make sure the environment file exists in the `envs/` directory

2. **Database connection failed**

   ```
   ❌ Database connection failed
   ```

   **Solution**: Check database credentials in the environment file

3. **Port already in use**
   ```
   ❌ Port 3000 is already in use
   ```
   **Solution**: Kill the existing process or use a different port

### Debug Mode

To see more detailed information about the environment copying process, check the console output when starting the development server.

## Best Practices

1. **Always use environment-specific commands** for different environments
2. **Never commit `.env` files** to version control
3. **Update environment files** when changing database or API configurations
4. **Use strong secrets** for production environments
5. **Test environment changes** in staging before production

## Examples

### Starting Local Development

```bash
bun run dev
# ✅ Copied envs/env.local to .env
# 🚀 Starting development server with local environment...
```

### Starting Production Development

```bash
bun run dev prod
# ✅ Copied envs/env.prod to .env
# 🚀 Starting development server with prod environment...
```

### Stopping Development Server

```bash
# Press Ctrl+C
# 🛑 Stopping development server...
```
