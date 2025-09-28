import { FastifyInstance } from "fastify";

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

// Auth types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
  token: string;
}

// User update types
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsersListResponse {
  users: UserResponse[];
  pagination: PaginationResponse;
}

// JWT payload
export interface JWTPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

// Fastify instance with custom properties
declare module "fastify" {
  interface FastifyInstance {
    db: any; // Drizzle database instance
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user?: JWTPayload;
  }
}

export { FastifyInstance };
