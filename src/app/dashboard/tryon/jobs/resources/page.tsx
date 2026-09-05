import Link from "next/link";

type PageProps = { searchParams: Promise<{ ids?: string }> };

export default async function GenerationResourcesPage({ searchParams }: PageProps) {
  const { ids = "" } = await searchParams;
  const fileIds = ids
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value, index, values) => Number.isInteger(value) && value > 0 && values.indexOf(value) === index);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red-500">Trabajos IA</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Open resources</h1>
          <p className="mt-2 text-sm text-zinc-500">{fileIds.length} recurso{fileIds.length === 1 ? "" : "s"} generado{fileIds.length === 1 ? "" : "s"}.</p>
        </div>
        <Link href="/dashboard/tryon/jobs" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:text-white">Volver a Trabajos IA</Link>
      </div>

      {fileIds.length === 0 ? (
        <section className="luxia-panel rounded-3xl p-8 text-sm text-zinc-500">No se recibieron recursos válidos.</section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {fileIds.map((fileId, index) => {
            const contentUrl = `/api/admin/storage/files/${fileId}/content?download=0`;
            const downloadUrl = `/api/admin/storage/files/${fileId}/content?download=1`;
            return (
              <article key={fileId} className="luxia-panel overflow-hidden rounded-3xl">
                <div className="flex min-h-[28rem] items-center justify-center bg-black/40 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={contentUrl} alt={`Resource ${index + 1}`} className="max-h-[75vh] w-full object-contain" />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/6 p-4">
                  <span className="font-mono text-xs text-zinc-500">storage_file_id #{fileId}</span>
                  <a href={downloadUrl} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">Download</a>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
