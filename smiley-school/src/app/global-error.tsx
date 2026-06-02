"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bg">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#0F1F3D", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{ background: "#F4B942", color: "#0F1F3D", border: "none", borderRadius: "8px", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ background: "transparent", color: "#F4B942", border: "2px solid #F4B942", borderRadius: "8px", padding: "0.75rem 1.5rem", fontWeight: 700, textDecoration: "none" }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
