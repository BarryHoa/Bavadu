# Security Documentation

## Overview

This document outlines the security measures implemented in the application and best practices for maintaining security.

## Security Features

### 1. Authentication & Authorization

- **Session-based authentication** with secure cookie handling
- **CSRF protection** using Double Submit Cookie Pattern
- **Structured logging** for authentication failures and security events
- **Rate limiting** to prevent brute force attacks

### 2. Input Validation & Sanitization

- **Valibot schemas** for request validation
- **JSON-RPC parameter validation** and sanitization
- **XSS protection utilities** for user-generated content
- **SQL injection protection** via Drizzle ORM (parameterized queries)

### 3. Security Headers

- **Content Security Policy (CSP)** - Configured with appropriate directives
- **X-Frame-Options** - Prevents clickjacking
- **X-Content-Type-Options** - Prevents MIME type sniffing
- **Strict-Transport-Security (HSTS)** - Enforces HTTPS in production
- **X-XSS-Protection** - Additional XSS protection

### 4. Logging & Monitoring

- **Security event logging** for authentication failures
- **Structured logging** format for easy parsing
- **IP address and user agent tracking** for security events

## Security Utilities

### XSS Protection

Located in `module-base/server/utils/xss-protection.ts`:

```typescript
import { escapeHtml, sanitizeUrl, sanitizeUserInput } from "@base/server/utils/xss-protection";

// Escape HTML content
const safe = escapeHtml(userInput);

// Sanitize URLs
const safeUrl = sanitizeUrl(userUrl);

// Sanitize user input with options
const sanitized = sanitizeUserInput(userInput, {
  maxLength: 1000,
  stripTags: true,
});
```

### Security Logging

Located in `module-base/server/utils/security-logger.ts`:

```typescript
import { logAuthFailure, logSuspiciousRequest } from "@base/server/utils/security-logger";

// Log authentication failure
logAuthFailure("Invalid credentials", {
  ip: "192.168.1.1",
  username: "user@example.com",
  path: "/api/auth/login",
});
```

## Dependency Security

### Automated Security Scanning

Run security checks regularly:

```bash
# Run all security checks
npm run security:check

# Run npm audit only
npm run security:audit

# Check for outdated packages
npm run security:outdated
```

### Manual Security Checks

```bash
# Check for known vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Fix automatically fixable issues
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

### Recommended Practices

1. **Regular Updates**: Run `npm run security:check` weekly
2. **Monitor Advisories**: Subscribe to security advisories for dependencies
3. **Update Promptly**: Apply security patches as soon as they're available
4. **Review Changes**: Test thoroughly after updating dependencies

## Content Security Policy (CSP)

### Current Configuration

The CSP is configured in `module-base/server/middleware/security-headers.ts`.

**Note**: Currently uses `'unsafe-eval'` and `'unsafe-inline'` for Next.js compatibility.

### Future Improvements

To improve CSP security:

1. **Implement Nonce-based CSP**:
   - Generate nonces for inline scripts and styles
   - Replace `'unsafe-inline'` with `'nonce-{value}'`
   - Pass nonces to React components

2. **Remove unsafe-eval**:
   - Audit dependencies to identify what requires `'unsafe-eval'`
   - Consider alternatives or updates to dependencies

3. **Use strict-dynamic**:
   - For better compatibility with modern frameworks
   - Allows scripts loaded by trusted scripts

## Input Validation

### JSON-RPC Validation

All JSON-RPC requests are validated:

- Method name format: `<model-id>.<sub-type>.<method>`
- Parameters are sanitized to prevent XSS
- Method names are validated against allowed patterns

### Request Validation

Use Valibot schemas for all user inputs:

```typescript
import * as v from "valibot";
import { validateRequest } from "@base/server/validation/middleware";

const schema = v.object({
  username: v.string(),
  email: v.email(),
});

const result = await validateRequest(request, schema);
if (!result.valid) {
  return result.response;
}
```

## Best Practices

### 1. Always Validate Input

- Use Valibot schemas for all user inputs
- Validate on both client and server side
- Sanitize before storing or displaying

### 2. Use Parameterized Queries

- Always use Drizzle ORM for database queries
- Never concatenate user input into SQL queries
- Use prepared statements

### 3. Escape Output

- Use XSS protection utilities when displaying user content
- Escape HTML, JavaScript, and URL content appropriately
- Use React's built-in XSS protection (but don't rely solely on it)

### 4. Log Security Events

- Log all authentication failures
- Monitor for suspicious patterns
- Set up alerts for critical security events

### 5. Keep Dependencies Updated

- Run `npm run security:check` regularly
- Update dependencies promptly when security patches are released
- Review changelogs for breaking changes

## Security Checklist

Before deploying to production:

- [ ] All dependencies are up to date
- [ ] No known vulnerabilities (`npm audit` passes)
- [ ] Security headers are properly configured
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured
- [ ] Authentication logging is enabled
- [ ] Input validation is implemented for all endpoints
- [ ] User-generated content is sanitized
- [ ] HTTPS is enforced in production
- [ ] Environment variables are secure
- [ ] Secrets are not committed to version control

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Contact the security team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [React Security](https://react.dev/learn/escape-hatches)
- [Valibot Documentation](https://valibot.dev/)

