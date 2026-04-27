import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) notFound();
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-fraunces text-3xl font-semibold text-[var(--navy-deep)]">Post: {slug}</h1>
        <p className="mt-4 text-[var(--text-muted)]">Coming soon.</p>
      </div>
    </section>
  );
}
