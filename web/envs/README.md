# Environment Configuration

This directory contains environment configuration files for different deployment stages.

## Available Environment Files

### `.env.example`

- Template file with all required environment variables
- Use this as a reference for setting up your environment
- Copy to create your actual environment files

### `env.local`

- Local development environment
- Copy to `.env.local` in the root directory for local development
- Contains development-specific settings

### `env.staging`

- Staging environment configuration
- Copy to `.env.staging` in the root directory for staging deployment
- Contains staging-specific settings

### `env.production`

- Production environment configuration
- Copy to `.env.production` in the root directory for production deployment
- Contains production-specific settings with enhanced security

### `env.test`

- Test environment configuration
- Copy to `.env.test` in the root directory for testing
- Contains test-specific settings

## Usage

### For Local Development

```bash
cp envs/env.local .env.local
```

### For Staging Deployment

```bash
cp envs/env.staging .env.staging
```

### For Production Deployment

```bash
cp envs/env.production .env.production
```

### For Testing

```bash
cp envs/env.test .env.test
```

## Environment Variables

### Database Configuration

- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT token expiration time

### Next.js Configuration

- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key

### Application Settings

- `NODE_ENV`: Node.js environment (development, staging, production, test)
- `DEBUG`: Enable debug mode
- `LOG_LEVEL`: Logging level (debug, info, error)

### Security Settings (Production/Staging)

- `CORS_ORIGIN`: Allowed CORS origins
- `RATE_LIMIT_MAX`: Maximum requests per window
- `RATE_LIMIT_WINDOW`: Rate limit window in milliseconds

## Security Notes

1. **Never commit actual environment files** (`.env.local`, `.env.production`, etc.) to version control
2. **Use strong, unique secrets** for production environments
3. **Rotate secrets regularly** in production
4. **Use different databases** for different environments
5. **Enable SSL/TLS** for production database connections

## Docker Support

For Docker deployments, you can mount the appropriate environment file:

```bash
# Local development
docker run -v $(pwd)/envs/env.local:/app/.env.local your-app

# Production
docker run -v $(pwd)/envs/env.production:/app/.env.production your-app
```
