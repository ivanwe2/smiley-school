"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-fraunces font-semibold text-[var(--navy-deep)] mb-2">Something went wrong</h1>
      <p className="text-[var(--text-muted)] mb-8 max-w-md">
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-lg bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-medium text-sm hover:bg-[var(--yellow-deep)] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}