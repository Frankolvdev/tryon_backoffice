export type ModalGpu = "T4" | "L4" | "A10G" | "L40S" | "A100-40GB" | "A100-80GB" | "RTX-PRO-6000" | "H100" | "H200" | "B200" | "B300";

export interface AiEngineSettings {
  local_parallel_executions: number;
  runpod_min_workers: number;
  runpod_max_workers: number;
  runpod_dispatch_workers: number;
  runpod_max_in_flight: number;
  modal_gpu: ModalGpu;
  modal_min_containers: number;
  modal_max_containers: number;
  modal_concurrency: number;
  modal_input_concurrency: number;
  modal_scaledown_window_seconds: number;
  modal_execution_timeout_seconds: number;
  queue_block_seconds: number;
  effective_runpod_parallelism: number;
  requires_restart: boolean;
}
export type AiEngineSettingsUpdate = Omit<AiEngineSettings, "effective_runpod_parallelism" | "requires_restart">;
