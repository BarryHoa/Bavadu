# Environment Configuration System

This document describes the environment configuration system for the Bavadu project.

## Directory Structure

```
web/envs/
├── .env.example          # Template with all required variables
├── env.local            # Local development environment
├── env.staging          # Staging environment
├── env.prod             # Production environment
├── env.test             # Test environment
├── README.md            # Detailed documentation
└── setup-env.sh         # Setup script
```

## Quick Start

### 1. Set up local development environment

```bash
npm run env:local
```

### 2. Set up all environments

```bash
npm run env:setup all
```

### 3. Manual setup

```bash
# Copy specific environment file
cp envs/env.local env.local
cp envs/env.prod env.prod
```

## Available Scripts

- `npm run env:setup` - Show setup options
- `npm run env:local` - Set up local development
- `npm run env:staging` - Set up staging environment
- `npm run env:production` - Set up production environment
- `npm run env:test` - Set up test environment

## Environment Files

### Local Development (`env.local`)

- Database: `bava_db_local`
- Debug mode enabled
- Localhost URLs
- Development-specific settings

### Staging (`env.staging`)

- Database: `bava_db_staging`
- Staging domain URLs
- Moderate security settings
- Debug mode enabled

### Production (`env.prod`)

- Database: `bava_db_production`
- Production domain URLs
- Enhanced security settings
- Debug mode disabled
- Rate limiting enabled

### Test (`env.test`)

- Database: `bava_db_test`
- Short JWT expiration
- Minimal logging
- Test-specific settings

## Security Features

### Production Security

- Strong, unique secrets required
- SSL/TLS database connections
- CORS origin restrictions
- Rate limiting enabled
- Error logging only

### Development Security

- Local database connections
- Debug mode enabled
- Detailed logging
- Relaxed CORS settings

## Database Configuration

Each environment uses a separate database:

- **Local**: `bava_db_local`
- **Staging**: `bava_db_staging`
- **Production**: `bava_db_production`
- **Test**: `bava_db_test`

## Deployment

### Docker Support

```bash
# Local development
docker run -v $(pwd)/envs/env.local:/app/env.local your-app

# Production
docker run -v $(pwd)/envs/env.prod:/app/env.prod your-app
```

### Environment Variables

All environment files are automatically ignored by git to prevent accidental commits of sensitive data.

## Best Practices

1. **Never commit actual environment files** to version control
2. **Use strong, unique secrets** for production
3. **Rotate secrets regularly** in production
4. **Use different databases** for different environments
5. **Enable SSL/TLS** for production database connections
6. **Monitor environment variables** for security compliance

## Troubleshooting

### Common Issues

1. **Environment file not found**: Make sure to copy from `envs/` directory
2. **Database connection failed**: Check database credentials and host
3. **JWT errors**: Verify JWT_SECRET is set correctly
4. **CORS issues**: Check CORS_ORIGIN settings

### Support

For environment-related issues, refer to the `envs/README.md` file for detailed documentation.
