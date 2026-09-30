"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[var(--navy-deep)] text-white p-8 text-center m-0 font-sans">
        <div>
          <h1 className="font-fraunces text-3xl font-bold mb-4">
            Something went wrong
          </h1>
          <p className="text-[var(--navy-light)]/70 mb-8">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={reset}
              className="bg-[var(--yellow-primary)] text-[var(--navy-deep)] font-bold rounded-xl px-6 py-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <a
              href="/"
              className="border-2 border-[var(--yellow-primary)] text-[var(--yellow-primary)] font-bold rounded-xl px-6 py-3 no-underline hover:opacity-90 transition-opacity"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
