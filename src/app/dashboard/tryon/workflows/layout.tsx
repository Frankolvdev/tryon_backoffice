"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";
import type {
  ReactNode,
} from "react";

import {
  Plus,
} from "lucide-react";

interface WorkflowLayoutProps {
  children: ReactNode;
}

export default function WorkflowLayout({
  children,
}: Readonly<WorkflowLayoutProps>) {
  const pathname = usePathname();

  const isCreatePage =
    pathname ===
    "/dashboard/tryon/workflows/new";

  return (
    <>
      {!isCreatePage && (
        <div className="mb-5 flex justify-end">
          <Link
            href="/dashboard/tryon/workflows/new"
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600"
          >
            <Plus size={16} />
            Nuevo workflow
          </Link>
        </div>
      )}

      {children}
    </>
  );
}
