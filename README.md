# Bava Backend System

A modern backend system built with Fastify, TypeScript, Drizzle ORM, and PostgreSQL.

## 🚀 Features

- **Fastify Framework**: High-performance web framework
- **TypeScript**: Type-safe development
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Robust relational database
- **JWT Authentication**: Secure token-based auth
- **Modular Architecture**: Organized route groups and middleware
- **Docker Support**: Containerized development environment

## 📁 Project Structure

```
Bava/
├── docker/                 # Docker configuration
│   ├── docker-compose.yml
│   └── init-scripts/       # Database initialization
├── systems/               # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   │   └── groups/    # Route groups
│   │   │       ├── auth/  # Authentication routes
│   │   │       ├── user/  # User management routes
│   │   │       └── health/# Health check routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── db/           # Database configuration
│   │   └── plugins/      # Fastify plugins
│   └── package.json
└── web/                  # Frontend (future)
```

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: JWT
- **Containerization**: Docker

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) installed

### 1. Clone the repository

```bash
git clone git@github.com:BarryHoa/Bavadu.git
cd Bavadu
```

### 2. Start the database

```bash
cd docker
docker-compose up -d postgres
```

### 3. Install dependencies

```bash
cd systems
bun install
```

### 4. Set up environment variables

```bash
cp env.example .env
```

### 5. Run database migrations

```bash
bun run db:migrate
```

### 6. Start the development server

```bash
bun run dev
```

The server will start on `http://localhost:3001`

## 📚 API Endpoints

### Health Check
- `GET /health` - Detailed health status
- `GET /ping` - Simple ping
- `GET /live` - Liveness check
- `GET /ready` - Readiness check

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🐳 Docker

### Start all services
```bash
cd docker
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

## 🧪 Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio

# Testing
bun run test         # Run tests
bun run type-check   # Type checking
```

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bava_db
DB_USER=bava_user
DB_PASSWORD=bava_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

BarryHoa - [GitHub](https://github.com/BarryHoa)
