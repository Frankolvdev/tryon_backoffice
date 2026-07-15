"use client";

import {
  ChevronDown,
  ChevronUp,
  FolderCog,
} from "lucide-react";
import { useState } from "react";

import { SystemSettingCard } from "@/components/backoffice/system/system-setting-card";

import type {
  SystemSettingResponse,
} from "@/types/admin-system-settings";

interface SystemSettingsCategoryProps {
  category: string;
  settings: SystemSettingResponse[];
  onSaved: (
    setting: SystemSettingResponse,
  ) => void;
}

export function SystemSettingsCategory({
  category,
  settings,
  onSaved,
}: SystemSettingsCategoryProps) {
  const [isOpen, setIsOpen] =
    useState(true);

  return (
    <section className="luxia-panel overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="flex w-full items-center justify-between gap-4 border-b border-white/6 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/15 text-red-400">
            <FolderCog size={17} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              {category}
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              {settings.length} configuraciones
            </p>
          </div>
        </div>

        {isOpen ? (
          <ChevronUp
            size={18}
            className="text-zinc-600"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-zinc-600"
          />
        )}
      </button>

      {isOpen && (
        <div className="grid gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-3">
          {settings.map((setting) => (
            <SystemSettingCard
              key={setting.id}
              setting={setting}
              onSaved={onSaved}
            />
          ))}
        </div>
      )}
    </section>
  );
}
