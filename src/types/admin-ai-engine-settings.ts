export type ModalGpu = "L4" | "L40S" | "A10G" | "A100-40GB" | "A100-80GB" | "H100";

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
