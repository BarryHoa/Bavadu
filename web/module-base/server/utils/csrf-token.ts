import { CSRF_CONFIG } from "@base/server/config";
import { createHmac, randomBytes } from "crypto";

/**
 * CSRF token configuration
 */
export interface CsrfTokenConfig {
  /**
   * Secret key for token generation
   * @default process.env.CSRF_SECRET || 'csrf-secret-key-change-in-production'
   */
  secret?: string;
  /**
   * Token length in bytes
   * @default 32
   */
  tokenLength?: number;
  /**
   * Token expiration time in milliseconds
   * @default 24 * 60 * 60 * 1000 (24 hours)
   */
  expirationMs?: number;
}

/**
 * Default CSRF configuration
 */
const defaultConfig: Required<CsrfTokenConfig> = {
  secret: CSRF_CONFIG.secret,
  tokenLength: CSRF_CONFIG.tokenLength,
  expirationMs: CSRF_CONFIG.expirationMs,
};

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(config: CsrfTokenConfig = {}): string {
  const finalConfig = { ...defaultConfig, ...config };
  return randomBytes(finalConfig.tokenLength).toString("hex");
}

/**
 * Create a signed CSRF token with expiration
 */
export function createSignedCsrfToken(config: CsrfTokenConfig = {}): {
  token: string;
  signedToken: string;
  expiresAt: number;
} {
  const finalConfig = { ...defaultConfig, ...config };
  const token = generateCsrfToken(finalConfig);
  const expiresAt = Date.now() + finalConfig.expirationMs;

  // Create signature: HMAC(token + expiresAt)
  const data = `${token}:${expiresAt}`;
  const signature = createHmac("sha256", finalConfig.secret)
    .update(data)
    .digest("hex");

  // Return token:signature:expiresAt
  const signedToken = `${token}:${signature}:${expiresAt}`;

  return {
    token,
    signedToken,
    expiresAt,
  };
}

/**
 * Verify a signed CSRF token
 */
export function verifyCsrfToken(
  signedToken: string,
  config: CsrfTokenConfig = {}
): {
  valid: boolean;
  expired: boolean;
  token?: string;
} {
  const finalConfig = { ...defaultConfig, ...config };

  try {
    const parts = signedToken.split(":");
    if (parts.length !== 3) {
      return { valid: false, expired: false };
    }

    const [token, signature, expiresAtStr] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiration
    if (Date.now() > expiresAt) {
      return { valid: false, expired: true };
    }

    // Verify signature
    const data = `${token}:${expiresAt}`;
    const expectedSignature = createHmac("sha256", finalConfig.secret)
      .update(data)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, expired: false };
    }

    return {
      valid: true,
      expired: false,
      token,
    };
  } catch (error) {
    return { valid: false, expired: false };
  }
}
