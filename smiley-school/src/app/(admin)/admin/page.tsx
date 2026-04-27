import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-fraunces font-semibold text-[var(--navy-deep)] mb-2">
        Dashboard
      </h1>
      <p className="text-[var(--text-muted)]">Welcome back! Here's a summary of your school.</p>
    </div>
  );
}
