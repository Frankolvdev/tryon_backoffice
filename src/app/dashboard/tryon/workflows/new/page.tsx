"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { WorkflowEditor } from "@/components/backoffice/tryon/workflow-editor";

import type {
  WorkflowDefinitionResponse,
} from "@/types/admin-workflows";

export default function NewWorkflowPage() {
  const router = useRouter();

  const handleSaved = (
    workflow: WorkflowDefinitionResponse,
  ) => {
    router.push(
      `/dashboard/tryon/workflows/${workflow.id}`,
    );
    router.refresh();
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Nuevo workflow"
        description="Crea una definición real compatible con ComfyUI local, RunPod Serverless o ambos modos."
      />

      <div className="mt-7">
        <Link
          href="/dashboard/tryon/workflows"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a workflows
        </Link>
      </div>

      <div className="mt-5">
        <WorkflowEditor
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}
