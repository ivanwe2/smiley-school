import { notFound } from "next/navigation";

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  if (!albumId) notFound();
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-fraunces text-3xl font-semibold text-[var(--navy-deep)]">Album</h1>
        <p className="mt-4 text-[var(--text-muted)]">Coming soon — ID: {albumId}</p>
      </div>
    </section>
  );
}
