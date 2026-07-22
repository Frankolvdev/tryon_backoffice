export interface AiEngineSettings {
  local_parallel_executions: number;
  runpod_min_workers: number;
  runpod_max_workers: number;
  runpod_dispatch_workers: number;
  runpod_max_in_flight: number;
  queue_block_seconds: number;
  effective_runpod_parallelism: number;
  requires_restart: boolean;
}

export type AiEngineSettingsUpdate = Omit<
  AiEngineSettings,
  "effective_runpod_parallelism" | "requires_restart"
>;
