import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — Smiley School",
    default: "Admin — Smiley School",
  },
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin layout wrapper — the actual sidebar/shell lives in
  // (admin)/admin/layout.tsx so the login page gets a clean slate
  return <>{children}</>;
}
