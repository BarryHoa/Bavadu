# Systems to Web Migration

This document describes the migration of the backend systems into the Next.js web application.

## What was migrated

### Database Layer

- **Schema**: Moved from `systems/src/db/schema.ts` to `web/server/db/schema.ts`
- **Database Connection**: Moved from `systems/src/db/index.ts` to `web/server/db/index.ts`
- **Drizzle Configuration**: Moved from `systems/drizzle.config.js` to `web/drizzle.config.js`

### Models and Interfaces

- **Base Model Controller**: Moved from `systems/src/Models/ModalController.ts` to `web/server/models/ModalController.ts`
- **Users Model**: Moved from `systems/src/Models/Users/UsersModel.ts` to `web/server/models/UsersModel.ts`
- **Interfaces**: Moved all interface files to `web/server/models/interfaces/`

### API Routes

The following API routes were created in Next.js App Router format:

#### User Management

- `GET /api/users` - List users with pagination, filtering, and search
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Health Checks

- `GET /api/health` - Health check endpoint
- `GET /api/ping` - Simple ping endpoint

## Dependencies Added

### Runtime Dependencies

- `bcryptjs` - Password hashing
- `drizzle-orm` - Database ORM
- `postgres` - PostgreSQL client
- `jsonwebtoken` - JWT token handling
- `lodash` - Utility functions

### Development Dependencies

- `@types/bcryptjs` - TypeScript types for bcryptjs
- `@types/lodash` - TypeScript types for lodash
- `@types/jsonwebtoken` - TypeScript types for jsonwebtoken
- `drizzle-kit` - Database migration tools

## Scripts Added

- `db:generate` - Generate database migrations
- `db:migrate` - Run database migrations
- `db:studio` - Open Drizzle Studio

## Environment Variables

Create a `env.local` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bava_db
DB_USER=bava_user
DB_PASSWORD=bava_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
```

## Usage

1. Install dependencies: `npm install`
2. Set up environment variables
3. Generate database migrations: `npm run db:generate`
4. Run database migrations: `npm run db:migrate`
5. Start the development server: `npm run dev`

## API Endpoints

All API endpoints are now available under `/api/` prefix:

- **Users**: `/api/users/*`
- **Authentication**: `/api/auth/*`
- **Health**: `/api/health`, `/api/ping`

## Next Steps

1. Implement actual database operations in the API routes
2. Add proper authentication middleware
3. Add input validation
4. Add error handling middleware
5. Add logging middleware
6. Add rate limiting
7. Add security headers

## Cleanup

After successful migration and testing, the `systems/` directory can be removed as all functionality has been moved to the web application.
