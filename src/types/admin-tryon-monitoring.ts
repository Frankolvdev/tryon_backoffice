import type { ExternalAiJobResponse } from "@/types/admin-runpod";
import type { AdminStorageFile } from "@/types/admin-storage";
import type { TryOnJobSummary } from "@/types/admin-tryon";
import type {
  WorkflowDefinitionListResponse,
} from "@/types/admin-workflows";

export interface TryOnMonitoringSnapshot {
  tryOnJobs: TryOnJobSummary[];
  externalAiJobs: ExternalAiJobResponse[];
  storageFiles: AdminStorageFile[];
  workflowDefinitions: WorkflowDefinitionListResponse;
}

export interface TryOnMonitoringMetrics {
  jobsTotal: number;
  jobsQueued: number;
  jobsProcessing: number;
  jobsCompleted: number;
  jobsFailed: number;
  jobsCanceled: number;
  successRate: number;
  tokensConsumed: number;
  estimatedGpuSeconds: number;
  actualGpuSeconds: number;
  estimatedGpuCostCents: number;
  actualGpuCostCents: number;
  averageActualGpuSeconds: number;
  externalJobsTotal: number;
  externalJobsRunning: number;
  externalJobsFailed: number;
  storageFilesTotal: number;
  storageBytes: number;
  activeWorkflows: number;
  defaultWorkflows: number;
}
