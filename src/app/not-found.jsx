export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The dashboard page you’re looking for doesn’t exist.
        </p>
        <a
          href="/dashboard"
          className="inline-block mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}