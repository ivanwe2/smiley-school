import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-fraunces font-bold text-[var(--yellow-primary)] mb-4">404</div>
      <h1 className="text-2xl font-fraunces font-semibold text-[var(--navy-deep)] mb-2">Page not found</h1>
      <p className="text-[var(--text-muted)] mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="px-5 py-2.5 rounded-lg bg-[var(--navy-deep)] text-white font-medium text-sm hover:bg-[var(--navy-mid)] transition-colors">
        Go home
      </Link>
    </div>
  );
}
