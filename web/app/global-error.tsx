
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 p-6">
          <h1 className="text-4xl font-semibold">Something went wrong</h1>
          <p className="text-default-500 max-w-prose">
            An unexpected error occurred. Please try again.
          </p>
          {error?.digest ? (
            <code className="text-xs text-default-400">{error.digest}</code>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}


