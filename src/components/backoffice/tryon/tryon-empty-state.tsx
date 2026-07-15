import {
  AlertTriangle,
  Database,
} from "lucide-react";

interface TryOnEmptyStateProps {
  title: string;
  description: string;
  error?: boolean;
}

export function TryOnEmptyState({
  title,
  description,
  error = false,
}: TryOnEmptyStateProps) {
  const Icon = error
    ? AlertTriangle
    : Database;

  return (
    <section className="luxia-panel flex min-h-72 items-center justify-center rounded-3xl p-8 text-center">
      <div>
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/15 text-red-400">
          <Icon size={22} />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          {title}
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
          {description}
        </p>
      </div>
    </section>
  );
}
