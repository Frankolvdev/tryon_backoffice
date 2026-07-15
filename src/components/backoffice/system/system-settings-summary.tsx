import {
  Eye,
  LockKeyhole,
  Pencil,
  RefreshCcw,
  Settings2,
} from "lucide-react";

import type {
  SystemSettingResponse,
} from "@/types/admin-system-settings";

interface SystemSettingsSummaryProps {
  settings: SystemSettingResponse[];
}

export function SystemSettingsSummary({
  settings,
}: SystemSettingsSummaryProps) {
  const editable = settings.filter(
    (setting) => setting.is_editable,
  ).length;

  const publicCount = settings.filter(
    (setting) => setting.is_public,
  ).length;

  const sensitive = settings.filter(
    (setting) => setting.is_sensitive,
  ).length;

  const restartRequired = settings.filter(
    (setting) => setting.requires_restart,
  ).length;

  const metrics = [
    {
      label: "Configuraciones",
      value: settings.length,
      icon: Settings2,
    },
    {
      label: "Editables",
      value: editable,
      icon: Pencil,
    },
    {
      label: "Públicas",
      value: publicCount,
      icon: Eye,
    },
    {
      label: "Sensibles",
      value: sensitive,
      icon: LockKeyhole,
    },
    {
      label: "Requieren reinicio",
      value: restartRequired,
      icon: RefreshCcw,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article
            key={metric.label}
            className="luxia-panel rounded-2xl p-5"
          >
            <Icon
              size={18}
              className="text-red-400"
            />

            <p className="mt-4 text-xs text-zinc-600">
              {metric.label}
            </p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {metric.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
