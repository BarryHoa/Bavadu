/**
 * Session data interface
 */
export interface SessionData {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parameters for creating a new session
 */
export interface CreateSessionParams {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: number; // milliseconds, default 7 days
}

/**
 * Result of session validation
 */
export interface ValidateSessionResult {
  valid: boolean;
  session?: SessionData;
}
