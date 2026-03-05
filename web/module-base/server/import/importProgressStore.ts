/**
 * In-memory store for import job progress (no DB).
 * Used by upload handler to create job and by processImport to update; SSE progress reads from here.
 */

export interface RowError {
  row: number;
  message: string;
  field?: string;
}

export interface ImportResult {
  totalRows: number;
  processed: number;
  successCount: number;
  errorCount: number;
  errors: RowError[];
}

export type ImportJobStatus = "pending" | "processing" | "done" | "error";

export interface ImportJobState {
  status: ImportJobStatus;
  processed: number;
  total: number;
  errors: RowError[];
  result?: ImportResult;
  errorMessage?: string;
  /** Permission required to access this job (e.g. hrm.timesheet.import). Set when job is created. */
  requiredPermission?: string;
  createdAt: number;
}

const store = new Map<string, ImportJobState>();

const JOB_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateJobId(): string {
  return `import-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createJob(metadata?: {
  requiredPermission?: string;
}): string {
  const jobId = generateJobId();

  store.set(jobId, {
    status: "pending",
    processed: 0,
    total: 0,
    errors: [],
    requiredPermission: metadata?.requiredPermission,
    createdAt: Date.now(),
  });

  return jobId;
}

export function getProgress(jobId: string): ImportJobState | undefined {
  return store.get(jobId);
}

export function setProgress(
  jobId: string,
  partial: Partial<Omit<ImportJobState, "createdAt" | "requiredPermission">>,
): void {
  const current = store.get(jobId);

  if (!current) return;

  Object.assign(current, partial);
}

export function cleanupExpiredJobs(): void {
  const now = Date.now();

  for (const [id, state] of Array.from(store.entries())) {
    if (now - state.createdAt > JOB_TTL_MS) {
      store.delete(id);
    }
  }
}
