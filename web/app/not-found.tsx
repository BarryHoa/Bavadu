export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-4xl font-semibold">404 - Page not found</h1>
      <p className="text-default-500 max-w-prose">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
        href="/"
      >
        Go home
      </a>
    </div>
  );
}
