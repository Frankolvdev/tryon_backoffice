"use client";

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  label?: string;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  pageSize,
  total,
  loading = false,
  label = "registros",
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const from = total === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(total, (safePage + 1) * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-white/6 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-600">
        {from.toLocaleString("es-MX")}–{to.toLocaleString("es-MX")} de {total.toLocaleString("es-MX")} {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={safePage === 0 || loading}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          className="h-9 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 disabled:opacity-30"
        >
          Anterior
        </button>
        <span className="min-w-24 text-center text-xs text-zinc-600">
          Página {safePage + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={safePage + 1 >= totalPages || loading}
          onClick={() => onPageChange(safePage + 1)}
          className="h-9 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 disabled:opacity-30"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
