/**
 * Log Types and Severity Definitions
 */

/**
 * Log Type Enum
 * Categorizes different types of logs in the system
 */
export enum LogType {
  // Security (Priority 1 - Critical)
  AUTH_FAILURE = "auth_failure",
  AUTH_SUCCESS = "auth_success",
  AUTHZ_FAILURE = "authz_failure",
  SUSPICIOUS_REQUEST = "suspicious_request",
  RATE_LIMIT = "rate_limit",
  CSRF_FAILURE = "csrf_failure",
  XSS_ATTEMPT = "xss_attempt",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",

  // Application (Priority 2 - Important)
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",

  // Request/Response (Priority 3 - Monitoring)
  HTTP_REQUEST = "http_request",
  HTTP_ERROR = "http_error",
  API_CALL = "api_call",
  SLOW_REQUEST = "slow_request",

  // Database (Priority 4 - Debugging)
  DB_QUERY = "db_query",
  DB_ERROR = "db_error",
  DB_SLOW_QUERY = "db_slow_query",
  DB_CONNECTION = "db_connection",

  // Business Logic (Priority 5 - Audit)
  USER_ACTION = "user_action",
  DATA_CHANGE = "data_change",
  TRANSACTION = "transaction",
  PAYMENT = "payment",

  // System (Priority 6 - Operations)
  SERVER_START = "server_start",
  SERVER_STOP = "server_stop",
  SERVER_ERROR = "server_error",
  MEMORY_USAGE = "memory_usage",
  CPU_USAGE = "cpu_usage",

  // Integration (Priority 7 - External)
  EXTERNAL_API = "external_api",
  WEBHOOK = "webhook",
  EMAIL = "email",
  FILE_UPLOAD = "file_upload",
  FILE_DOWNLOAD = "file_download",

  // Performance (Priority 8 - Optimization)
  PERFORMANCE = "performance",
  CACHE_HIT = "cache_hit",
  CACHE_MISS = "cache_miss",
  QUEUE_JOB = "queue_job",
}

export enum LogGroup {
  SECURITY = "security",
  APPLICATION = "application",
  REQUEST_RESPONSE = "request_response",
  DATABASE = "database",
  BUSINESS_LOGIC = "business_logic",
  SYSTEM = "system",
  INTEGRATION = "integration",
  PERFORMANCE = "performance",
}

/**
 * Log Severity Enum
 * Indicates the severity level of a log entry
 */
export enum LogSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Type guard to check if a string is a valid LogType
 */
export function isLogType(value: string): value is LogType {
  return Object.values(LogType).includes(value as LogType);
}

/**
 * Type guard to check if a string is a valid LogSeverity
 */
export function isLogSeverity(value: string): value is LogSeverity {
  return Object.values(LogSeverity).includes(value as LogSeverity);
}

export const LogTypesToGroups: Map<LogType, LogGroup> = new Map([
  [LogType.AUTH_FAILURE, LogGroup.SECURITY],
  [LogType.AUTH_SUCCESS, LogGroup.SECURITY],
  [LogType.AUTHZ_FAILURE, LogGroup.SECURITY],
  [LogType.SUSPICIOUS_REQUEST, LogGroup.SECURITY],
  [LogType.RATE_LIMIT, LogGroup.SECURITY],
  [LogType.CSRF_FAILURE, LogGroup.SECURITY],
  [LogType.XSS_ATTEMPT, LogGroup.SECURITY],
  [LogType.SQL_INJECTION_ATTEMPT, LogGroup.SECURITY],
  [LogType.ERROR, LogGroup.APPLICATION],
  [LogType.WARN, LogGroup.APPLICATION],
  [LogType.INFO, LogGroup.APPLICATION],
  [LogType.DEBUG, LogGroup.APPLICATION],
  [LogType.HTTP_REQUEST, LogGroup.REQUEST_RESPONSE],
  [LogType.HTTP_ERROR, LogGroup.REQUEST_RESPONSE],
  [LogType.API_CALL, LogGroup.REQUEST_RESPONSE],
  [LogType.SLOW_REQUEST, LogGroup.REQUEST_RESPONSE],
  [LogType.DB_QUERY, LogGroup.DATABASE],
  [LogType.DB_ERROR, LogGroup.DATABASE],
  [LogType.DB_SLOW_QUERY, LogGroup.DATABASE],
  [LogType.DB_CONNECTION, LogGroup.DATABASE],
  [LogType.USER_ACTION, LogGroup.BUSINESS_LOGIC],
  [LogType.DATA_CHANGE, LogGroup.BUSINESS_LOGIC],
  [LogType.TRANSACTION, LogGroup.BUSINESS_LOGIC],
  [LogType.PAYMENT, LogGroup.BUSINESS_LOGIC],
  [LogType.SERVER_START, LogGroup.SYSTEM],
  [LogType.SERVER_STOP, LogGroup.SYSTEM],
  [LogType.SERVER_ERROR, LogGroup.SYSTEM],
  [LogType.MEMORY_USAGE, LogGroup.SYSTEM],
  [LogType.CPU_USAGE, LogGroup.SYSTEM],
  [LogType.EXTERNAL_API, LogGroup.INTEGRATION],
  [LogType.WEBHOOK, LogGroup.INTEGRATION],
  [LogType.EMAIL, LogGroup.INTEGRATION],
  [LogType.FILE_UPLOAD, LogGroup.INTEGRATION],
  [LogType.FILE_DOWNLOAD, LogGroup.INTEGRATION],
  [LogType.PERFORMANCE, LogGroup.PERFORMANCE],
  [LogType.CACHE_HIT, LogGroup.PERFORMANCE],
  [LogType.CACHE_MISS, LogGroup.PERFORMANCE],
  [LogType.QUEUE_JOB, LogGroup.PERFORMANCE],
]);
