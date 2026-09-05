"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  Coins, Cpu, Download, Eye, ExternalLink, FilterX, LoaderCircle, RefreshCcw, RotateCcw, Search,
  Square, Trash2, UserRound, XCircle, DollarSign,
} from "lucide-react";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  GenerationExecutionStatus,
  GenerationModule,
  GenerationModuleExecution,
  GenerationModuleListResponse,
} from "@/types/admin-generation-modules";

type ExecutionListResponse = {
  items: GenerationModuleExecution[];
  total: number;
  skip: number;
  limit: number;
};

const ACTIVE_STATUSES = new Set<GenerationExecutionStatus>(["queued", "running"]);
const PAGE_SIZE = 50;
const TERMINAL_STATUSES = new Set<GenerationExecutionStatus>(["completed", "failed", "cancelled"]);

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-MX");
}

function formatBytes(bytes?: number | null) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}

function formatDuration(ms?: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}

function engineLabel(engine: string) {
  if (engine === "local_docker") return "Docker Local";
  if (engine === "owner_local") return "Owner Local";
  if (engine === "runpod_serverless") return "RunPod Serverless";
  if (engine === "simulated") return "Simulado";
  if (engine === "modal") return "Modal";
  return engine;
}

function statusLabel(status: string) {
  return ({ queued: "En cola", running: "Ejecutando", completed: "Completado", failed: "Fallido", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status;
}

function queueLabel(item: GenerationModuleExecution) {
  if (item.engine === "local_docker" || item.engine === "owner_local") return item.status === "queued" ? "Cola local" : "Worker local";
  if (item.engine === "runpod_serverless") {
    if (item.provider_status === "IN_QUEUE" || item.status === "queued") return "Cola RunPod";
    return "RunPod";
  }
  if (item.engine === "modal") return item.status === "queued" ? "Cola Modal" : "Modal";
  return "Simulado";
}

function providerState(item: GenerationModuleExecution) {
  return item.provider_status || (item.status === "queued" ? "Esperando despacho" : statusLabel(item.status));
}

function originLabel(item: GenerationModuleExecution) {
  const origin = typeof item.context?.origin === "string" ? item.context.origin.toLowerCase() : "";
  if (origin === "appweb") return "AppWeb";
  if (origin === "backoffice" || origin === "admin") return "BackOffice";
  if (origin === "api") return "API";
  if (origin === "system") return "Sistema";
  return item.user_id ? "AppWeb / API" : "BackOffice";
}

function safeSteps(item: GenerationModuleExecution) {
  return Array.isArray(item.steps) ? item.steps : [];
}

function safeLogs(item: GenerationModuleExecution) {
  return Array.isArray(item.logs) ? item.logs : [];
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function metricNumber(item: GenerationModuleExecution, key: string): number | null {
  const value = item.provider_metrics?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function runtimeMetricNumber(item: GenerationModuleExecution, key: string): number | null {
  const value = item.runtime_metrics?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

type TransportFileDiagnostic = {
  file_id: string;
  sha256?: string;
  size_bytes?: number;
  occurrence_count?: number;
  paths: string[];
  filenames: string[];
  node_ids: Array<string | number>;
};

function transportFiles(item: GenerationModuleExecution): TransportFileDiagnostic[] {
  const value = item.runtime_metrics?.transport_unique_files;
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.file_id !== "string") return [];
    return [{
      file_id: record.file_id,
      sha256: typeof record.sha256 === "string" ? record.sha256 : undefined,
      size_bytes: typeof record.size_bytes === "number" ? record.size_bytes : undefined,
      occurrence_count: typeof record.occurrence_count === "number" ? record.occurrence_count : undefined,
      paths: Array.isArray(record.paths) ? record.paths.filter((path): path is string => typeof path === "string") : [],
      filenames: Array.isArray(record.filenames) ? record.filenames.filter((name): name is string => typeof name === "string") : [],
      node_ids: Array.isArray(record.node_ids) ? record.node_ids.filter((node): node is string | number => typeof node === "string" || typeof node === "number") : [],
    }];
  });
}

function timingRows(item: GenerationModuleExecution): Array<{label:string; value:string; hint?:string}> {
  const rows: Array<{label:string; value:string; hint?:string}> = [];
  const push = (label:string, key:string, hint?:string) => {
    const value = metricNumber(item, key);
    if (value != null) rows.push({ label, value: formatDuration(value), hint });
  };
  push("Espera Backend / FunctionCall", "backend_modal_wait_ms", "Desde que Backend empieza a esperar el FunctionCall hasta recibir el resultado.");
  push("Runtime exacto Modal", "modal_runtime_exact_ms", "Tiempo medido dentro del runtime Modal.");
  push("Post-runtime dentro de Modal", "modal_post_runtime_ms", "Trabajo diagnóstico entre el retorno del GenerationRuntime y el inicio del return de la Function.");
  const payloadBytes = metricNumber(item, "modal_return_payload_base64_approx_bytes");
  if (payloadBytes != null) rows.push({ label: "Payload base64 de retorno", value: formatBytes(payloadBytes), hint: "Tamaño aproximado solo del contenido base64 retornado por Modal; no incluye todo el overhead del protocolo." });
  const payloadFiles = metricNumber(item, "modal_return_payload_generation_file_occurrences");
  if (payloadFiles != null) rows.push({ label: "Archivos pesados en payload", value: String(Math.round(payloadFiles)), hint: "Archivos únicos que realmente cargaron base64 en la respuesta Modal." });
  const logicalFiles = runtimeMetricNumber(item, "transport_generation_file_occurrences");
  if (logicalFiles != null) rows.push({ label: "Ocurrencias lógicas", value: String(Math.round(logicalFiles)), hint: "Apariciones de archivos encontradas en outputs, steps y context antes de deduplicar." });
  const uniqueFiles = runtimeMetricNumber(item, "transport_unique_file_count");
  if (uniqueFiles != null) rows.push({ label: "Archivos únicos", value: String(Math.round(uniqueFiles)), hint: "Contenidos diferentes identificados por SHA-256 y enviados una sola vez." });
  const duplicateFiles = runtimeMetricNumber(item, "transport_duplicate_file_occurrences");
  if (duplicateFiles != null) rows.push({ label: "Duplicados eliminados", value: String(Math.round(duplicateFiles)), hint: "Copias lógicas que fueron sustituidas por file_ref sin repetir base64." });
  const savedBytes = runtimeMetricNumber(item, "transport_saved_declared_file_bytes");
  if (savedBytes != null) rows.push({ label: "Binario ahorrado", value: formatBytes(savedBytes), hint: "Bytes de contenido que no se repitieron gracias al registro files + file_ref." });
  push("Cola → inicio runtime", "modal_queue_to_runtime_ms", "Disponible cuando el runtime desplegado entrega timestamps internos.");
  if (metricNumber(item, "modal_result_delivery_ms") != null) {
    push("Entrega Modal → Backend", "modal_result_delivery_ms", "Desde que Modal está listo para devolver el payload hasta que Backend lo recibe.");
  } else {
    push("Overhead no-runtime combinado", "modal_non_runtime_overhead_ms", "Runtime anterior sin timestamps finos: combina cola/startup/entrega; no se atribuye a una sola causa.");
  }
  push("Materialización Backend", "finalization_materialization_ms");
  push("Storage", "finalization_storage_ms", "R2, S3, Local u otro storage dinámico configurado.");
  push("Contexto", "finalization_context_ms");
  push("Billing", "finalization_billing_ms");
  push("Finalización Backend total", "finalization_total_ms");
  return rows;
}

function statusClass(status: string) {
  if (status === "completed") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (status === "running") return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  if (status === "queued") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  return "border-red-500/20 bg-red-500/10 text-red-300";
}

function resultResources(value: unknown, prefix = "Resultado"): Array<{ label: string; fileId?: number; href?: string }> {
  if (Array.isArray(value)) return value.flatMap((item, index) => resultResources(item, `${prefix} ${index + 1}`));
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const rawFileId = record.storage_file_id;
  const fileId = typeof rawFileId === "number" ? rawFileId : (typeof rawFileId === "string" && /^\d+$/.test(rawFileId) ? Number(rawFileId) : null);
  if (fileId && Number.isInteger(fileId) && fileId > 0) {
    return [{ label: typeof record.filename === "string" && record.filename ? record.filename : prefix, fileId }];
  }

  const legacyUrl = [record.preview_url, record.download_url, record.public_url, record.source_url, record.url]
    .find((item): item is string => typeof item === "string" && (/^https?:\/\//.test(item) || item.startsWith("/")));
  if (legacyUrl) return [{ label: typeof record.filename === "string" && record.filename ? record.filename : prefix, href: legacyUrl }];

  return Object.entries(record)
    .filter(([key]) => !["preview_url", "download_url", "public_url", "source_url", "url"].includes(key))
    .flatMap(([key, item]) => resultResources(item, key));
}

function dedupeResources(resources: Array<{ label: string; fileId?: number; href?: string }>) {
  const seen = new Set<string>();
  return resources.filter((resource) => {
    const key = resource.fileId ? `file:${resource.fileId}` : `url:${resource.href ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(resource.fileId || resource.href);
  });
}

function resourceUrl(resource: { fileId?: number; href?: string }, download: boolean) {
  if (resource.fileId) return `/api/admin/storage/files/${encodeURIComponent(String(resource.fileId))}/content?download=${download ? "1" : "0"}`;
  return resource.href ?? "";
}

function openResources(resources: Array<{ fileId?: number; href?: string }>) {
  const fileIds = resources.map((resource) => resource.fileId).filter((fileId): fileId is number => typeof fileId === "number");
  if (fileIds.length === resources.length && fileIds.length > 1) {
    const params = new URLSearchParams({ ids: fileIds.join(",") });
    window.open(`/dashboard/tryon/jobs/resources?${params.toString()}`, "_blank", "noopener,noreferrer");
    return;
  }
  const url = resources.length === 1 ? resourceUrl(resources[0], false) : "";
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  for (const resource of resources) {
    const fallbackUrl = resourceUrl(resource, false);
    if (fallbackUrl) window.open(fallbackUrl, "_blank", "noopener,noreferrer");
  }
}

function downloadResources(resources: Array<{ label: string; fileId?: number; href?: string }>) {
  const fileIds = resources.map((resource) => resource.fileId).filter((fileId): fileId is number => typeof fileId === "number");
  if (fileIds.length === resources.length && fileIds.length > 1) {
    const params = new URLSearchParams({ ids: fileIds.join(",") });
    window.location.href = `/api/admin/storage/files/download-bundle?${params.toString()}`;
    return;
  }
  for (const resource of resources) {
    const url = resourceUrl(resource, true);
    if (!url) continue;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = resource.label || "resource";
    anchor.rel = "noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}


export default function UnifiedAiJobsPage() {
  const [modules, setModules] = useState<GenerationModule[]>([]);
  const [executions, setExecutions] = useState<GenerationModuleExecution[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [moduleId, setModuleId] = useState("");
  const [status, setStatus] = useState("");
  const [engine, setEngine] = useState("");
  const [userId, setUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<GenerationModuleExecution | null>(null);
  const [billingSelected, setBillingSelected] = useState<GenerationModuleExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    try {
      const moduleResponse = await browserApiRequest<GenerationModuleListResponse>("/api/admin/generation-modules?limit=500");
      const moduleItems = Array.isArray(moduleResponse)
        ? (moduleResponse as unknown as GenerationModule[])
        : Array.isArray(moduleResponse.items)
          ? moduleResponse.items
          : [];
      setModules(moduleItems);
      setExpandedModules((current) => current.size ? current : new Set(moduleItems.map((item) => item.id)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar los módulos de IA.");
    }
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(page * PAGE_SIZE) });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (moduleId) params.set("module_id", moduleId);
      if (status) params.set("status", status);
      if (engine) params.set("engine", engine);
      if (userId) params.set("user_id", userId);
      if (dateFrom) params.set("created_from", new Date(`${dateFrom}T00:00:00`).toISOString());
      if (dateTo) params.set("created_to", new Date(`${dateTo}T23:59:59`).toISOString());

      const executionResponse = await browserApiRequest<ExecutionListResponse>(`/api/admin/generation-module-executions?${params}`);
      const executionItems = Array.isArray(executionResponse.items) ? executionResponse.items : [];
      setExecutions(executionItems);
      setSelectedIds((current) => new Set([...current].filter((id) => executionItems.some((item) => item.id === id))));
      setTotal(Number(executionResponse.total ?? 0));
      setSelected((current) => {
        if (!current) return null;
        return executionResponse.items.find((item) => item.id === current.id) ?? current;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar los trabajos de IA.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [dateFrom, dateTo, debouncedSearch, engine, moduleId, page, status, userId]);

  useEffect(() => { void loadModules(); }, [loadModules]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(0); }, [dateFrom, dateTo, debouncedSearch, engine, moduleId, status, userId]);

  const modulesById = useMemo(() => new Map(modules.map((item) => [item.id, item])), [modules]);
  const grouped = useMemo(() => {
    const map = new Map<number, GenerationModuleExecution[]>();
    for (const execution of executions) {
      const current = map.get(execution.module_id) ?? [];
      current.push(execution);
      map.set(execution.module_id, current);
    }
    return [...map.entries()].sort((a, b) => {
      const aName = modulesById.get(a[0])?.name ?? a[1][0]?.module_key ?? "";
      const bName = modulesById.get(b[0])?.name ?? b[1][0]?.module_key ?? "";
      return aName.localeCompare(bName, "es");
    });
  }, [executions, modulesById]);

  const metrics = useMemo(() => ({
    total,
    active: executions.filter((item) => ACTIVE_STATUSES.has(item.status)).length,
    queued: executions.filter((item) => item.status === "queued").length,
    localActive: executions.filter((item) => item.engine === "local_docker" && item.status === "running").length,
    runpodActive: executions.filter((item) => item.engine === "runpod_serverless" && ACTIVE_STATUSES.has(item.status)).length,
    completed: executions.filter((item) => item.status === "completed").length,
    failed: executions.filter((item) => item.status === "failed").length,
    tokens: executions.reduce((sum, item) => sum + (item.tokens_charged ?? 0), 0),
  }), [executions, total]);

  async function jobAction(execution: GenerationModuleExecution, action: "cancel" | "retry") {
    setBusyId(execution.id);
    setError(null);
    try {
      await browserApiRequest(`/api/admin/generation-modules/executions/${execution.id}/${action}`, {
        method: "POST",
        ...(action === "retry" ? { body: JSON.stringify({}) } : {}),
      });
      await load(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible completar la operación.");
    } finally {
      setBusyId(null);
    }
  }


  async function bulkAction(action: "bulk-cancel" | "bulk-delete") {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (action === "bulk-delete" && !window.confirm(`¿Eliminar ${ids.length} ejecución(es) seleccionada(s)? Las activas se omitirán.`)) return;
    setBulkBusy(true);
    setError(null);
    try {
      await browserApiRequest(`/api/admin/generation-modules/executions/${action}`, {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
      setSelectedIds(new Set());
      await load(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible completar la operación masiva.");
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleExecution(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setPage(0);
    setSearch(""); setModuleId(""); setStatus(""); setEngine(""); setUserId(""); setDateFrom(""); setDateTo("");
  }

  function toggleModule(id: number) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return <div className="space-y-7">
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red-500">Operación centralizada</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Trabajos IA</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Una sola vista para supervisar todas las ejecuciones de los módulos de generación, con progreso en vivo, usuario, motor, consumo, resultados, errores y acciones.</p>
      </div>
      <button onClick={() => void Promise.all([loadModules(), load()])} disabled={isLoading} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 hover:bg-white/[0.06] disabled:opacity-50">
        {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Actualizar
      </button>
    </header>

    {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"><AlertTriangle className="mr-2 inline" size={16}/>{error}</div>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Metric label="Total encontrado" value={metrics.total} icon={Activity}/>
      <Metric label="En cola" value={metrics.queued} icon={Clock3}/>
      <Metric label="Local ejecutando" value={metrics.localActive} icon={Cpu}/>
      <Metric label="RunPod activos" value={metrics.runpodActive} icon={Activity}/>
      <Metric label="Completados" value={metrics.completed} icon={CheckCircle2}/>
      <Metric label="Tokens cargados" value={metrics.tokens} icon={Coins}/>
    </section>

    <section className="luxia-panel rounded-3xl p-5">
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <label className="relative xl:col-span-2"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="ID, módulo, motor, estado o error..." className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none focus:border-red-500/40"/></label>
        <select value={moduleId} onChange={(e)=>setModuleId(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#09090a] px-3 text-sm text-zinc-300"><option value="">Todos los módulos</option>{modules.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <input type="number" min="1" value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="ID de usuario" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white"/>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#09090a] px-3 text-sm text-zinc-300"><option value="">Todos los estados</option><option value="queued">En cola</option><option value="running">Ejecutando</option><option value="completed">Completados</option><option value="failed">Fallidos</option><option value="cancelled">Cancelados</option></select>
        <select value={engine} onChange={(e)=>setEngine(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#09090a] px-3 text-sm text-zinc-300"><option value="">Todos los motores</option><option value="simulated">Simulado</option><option value="local_docker">Docker Local</option><option value="owner_local">Owner Local</option><option value="runpod_serverless">RunPod Serverless</option><option value="modal">Modal</option></select>
        <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#09090a] px-3 text-sm text-zinc-300" title="Desde"/>
        <div className="flex gap-3"><input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#09090a] px-3 text-sm text-zinc-300" title="Hasta"/><button onClick={clearFilters} title="Limpiar filtros" className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white"><FilterX size={17}/></button></div>
      </div>
    </section>

    <section className="luxia-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
      <label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={executions.length > 0 && executions.every((item) => selectedIds.has(item.id))} onChange={() => setSelectedIds(executions.length > 0 && executions.every((item) => selectedIds.has(item.id)) ? new Set() : new Set(executions.map((item) => item.id)))} className="size-4 accent-red-600"/>Seleccionar todo <span className="text-zinc-600">({selectedIds.size})</span></label>
      <div className="flex flex-wrap gap-2"><button disabled={bulkBusy || !executions.some((item) => selectedIds.has(item.id) && ACTIVE_STATUSES.has(item.status))} onClick={() => void bulkAction("bulk-cancel")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300 disabled:opacity-40"><Square size={14}/>Cancelar seleccionadas</button><button disabled={bulkBusy || selectedIds.size === 0} onClick={() => void bulkAction("bulk-delete")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300 disabled:opacity-40"><Trash2 size={15}/>Eliminar seleccionadas</button></div>
    </section>

    {isLoading ? <section className="luxia-panel flex min-h-72 items-center justify-center rounded-3xl"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-red-500"/><p className="mt-4 text-sm text-zinc-500">Consultando trabajos...</p></div></section> : grouped.length === 0 ? <section className="luxia-panel rounded-3xl p-12 text-center"><Activity className="mx-auto text-zinc-700"/><h2 className="mt-4 font-semibold text-white">No hay trabajos que coincidan</h2><p className="mt-2 text-sm text-zinc-500">Ajusta los filtros o ejecuta un módulo de generación.</p></section> : <div className="space-y-4">
      {grouped.map(([id, jobs]) => {
        const module = modulesById.get(id);
        const isExpanded = expandedModules.has(id);
        const active = jobs.filter((item)=>ACTIVE_STATUSES.has(item.status)).length;
        return <section key={id} className="luxia-panel overflow-hidden rounded-3xl">
          <button onClick={()=>toggleModule(id)} className="flex w-full items-center justify-between gap-4 border-b border-white/6 p-5 text-left hover:bg-white/[0.02]">
            <div className="flex min-w-0 items-center gap-4">{isExpanded?<ChevronDown size={18}/>:<ChevronRight size={18}/>}<div><h2 className="font-semibold text-white">{module?.name ?? jobs[0]?.module_key}</h2><p className="mt-1 text-xs text-zinc-600">{module?.key ?? jobs[0]?.module_key} · {jobs.length} trabajo{jobs.length===1?"":"s"}{active?` · ${active} activo${active===1?"":"s"}`:""}</p></div></div>
            {active>0&&<span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">Activo</span>}
          </button>
          {isExpanded && <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-zinc-600"><tr><th className="p-4">Seleccionar</th><th>Trabajo</th><th>Usuario</th><th>Motor</th><th>Estado</th><th>Progreso</th><th>Tokens</th><th>Tiempo backend</th><th>Tiempo real</th><th>Resultado / error</th><th className="pr-4">Acciones</th></tr></thead><tbody>{jobs.map((job)=>{
            const resources=dedupeResources(resultResources(job.outputs)); const busy=busyId===job.id;
            return <tr key={job.id} className="border-t border-white/5 align-top"><td className="p-4"><input type="checkbox" checked={selectedIds.has(job.id)} onChange={()=>toggleExecution(job.id)} className="size-4 accent-red-600"/></td><td className="pt-4"><p className="font-medium text-white">{job.module_key}</p><p className="mt-1 max-w-40 truncate font-mono text-[10px] text-zinc-700" title={job.id}>{job.id}</p><p className="mt-1 text-[10px] text-zinc-600">{formatDate(job.created_at)}</p></td><td><div className="pt-4"><div className="flex items-center gap-2 text-zinc-300"><UserRound size={14}/>{originLabel(job)}</div><p className="mt-1 text-[10px] text-zinc-600">{job.user_id?`Usuario #${job.user_id}`:"Administrador"}</p></div></td><td className="pt-4 text-zinc-400"><Cpu size={14} className="mr-2 inline"/>{engineLabel(job.engine)}<p className="mt-1 text-[10px] text-zinc-600">{job.queue_name || queueLabel(job)}{job.queue_position ? ` · #${job.queue_position}` : ""}</p></td><td className="pt-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${statusClass(job.status)}`}>{statusLabel(job.status)}</span></td><td className="pt-4"><div className="w-32"><div className="flex justify-between text-[10px] text-zinc-600"><span>{job.progress}%</span><span>{safeSteps(job).filter(s=>s.status==="completed").length}/{safeSteps(job).length}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-red-600 transition-all" style={{width:`${job.progress}%`}}/></div></div></td><td className="pt-4 text-zinc-400">
              <span>{job.tokens_charged??0} cobrados</span>
              {(job.result_locked || job.billing_breakdown?.result_locked) && (
                <p className="mt-1 text-[10px] text-amber-300">
                  +{job.estimated_pending_tokens ?? job.billing_breakdown?.estimated_pending_tokens ?? "?"} pendientes
                </p>
              )}
            </td><td className="pt-4 text-zinc-500">{formatDuration(job.duration_ms)}</td><td className="pt-4 text-zinc-300">{formatDuration(job.real_provider_duration_ms)}</td><td className="max-w-xs pt-4">{job.error?<p className="line-clamp-2 text-xs text-red-300" title={job.error}>{job.error}</p>:(job.result_locked || job.billing_breakdown?.result_locked)?<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2"><p className="text-xs font-semibold text-amber-300">Resultado bloqueado</p><p className="mt-1 text-[10px] text-zinc-500">Generado correctamente; conciliación pendiente por saldo insuficiente.</p></div>:resources.length?<div className="flex flex-col gap-2"><button type="button" onClick={()=>openResources(resources)} className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200"><ExternalLink size={12}/>Open resources{resources.length>1?` (${resources.length})`:""}</button><button type="button" onClick={()=>downloadResources(resources)} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"><Download size={12}/>Download resources{resources.length>1?` (${resources.length})`:""}</button></div>:<span className="text-xs text-zinc-600">{ACTIVE_STATUSES.has(job.status)?"Procesando...":"Sin archivo visible"}</span>}</td><td className="pr-4 pt-3"><div className="flex gap-2"><button onClick={()=>setSelected(job)} className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:text-white" title="Ver detalle"><Eye size={15}/></button><button onClick={()=>setBillingSelected(job)} className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10" title="Desglose del cobro"><DollarSign size={15}/></button>{ACTIVE_STATUSES.has(job.status)&&<button disabled={busy} onClick={()=>void jobAction(job,"cancel")} className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:text-red-300 disabled:opacity-40" title="Cancelar">{busy?<LoaderCircle size={15} className="animate-spin"/>:<Square size={14}/>}</button>}{TERMINAL_STATUSES.has(job.status)&&<button disabled={busy} onClick={()=>void jobAction(job,"retry")} className="flex size-9 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-40" title="Reintentar">{busy?<LoaderCircle size={15} className="animate-spin"/>:<RotateCcw size={15}/>}</button>}</div></td></tr>})}</tbody></table></div>}
        </section>
      })}
    </div>}


    {total > PAGE_SIZE && <section className="luxia-panel flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">Página {page + 1} de {Math.max(1, Math.ceil(total / PAGE_SIZE))} · {total.toLocaleString("es-MX")} trabajos</p>
      <div className="flex gap-2">
        <button type="button" disabled={page === 0 || isLoading} onClick={() => setPage((current) => Math.max(0, current - 1))} className="h-10 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 disabled:opacity-40">Anterior</button>
        <button type="button" disabled={(page + 1) * PAGE_SIZE >= total || isLoading} onClick={() => setPage((current) => current + 1)} className="h-10 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 disabled:opacity-40">Siguiente</button>
      </div>
    </section>}

    {billingSelected && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={event=>{if(event.target===event.currentTarget)setBillingSelected(null)}}><section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-emerald-500/20 bg-[#0b0b0d] p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-emerald-400">Desglose del cobro</p><h2 className="mt-2 text-xl font-semibold text-white">{billingSelected.module_key}</h2><p className="mt-1 font-mono text-[11px] text-zinc-600">{billingSelected.id}</p></div><button onClick={()=>setBillingSelected(null)} className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400"><XCircle size={17}/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Tokens cobrados" value={String(billingSelected.tokens_charged ?? 0)}/><Detail label="Tiempo backend" value={formatDuration(billingSelected.duration_ms)}/><Detail label="Tiempo real proveedor" value={formatDuration(billingSelected.real_provider_duration_ms)}/><Detail label="Inicio proveedor" value={formatDate(billingSelected.provider_started_at)}/><Detail label="Fin proveedor" value={formatDate(billingSelected.provider_finished_at)}/><Detail label="Estado" value={statusLabel(billingSelected.status)}/></div><div className="mt-6"><h3 className="text-sm font-semibold text-white">Cálculo guardado por el backend</h3><pre className="mt-3 max-h-[50vh] overflow-auto rounded-2xl border border-white/6 bg-black/30 p-4 text-[11px] leading-5 text-zinc-300">{prettyJson(billingSelected.billing_breakdown ?? {})}</pre></div></section></div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0d] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-red-500">Detalle de ejecución</p><h2 className="mt-2 text-xl font-semibold text-white">{modulesById.get(selected.module_id)?.name ?? selected.module_key}</h2><p className="mt-1 font-mono text-[11px] text-zinc-600">{selected.id}</p></div><button onClick={()=>setSelected(null)} className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white"><XCircle size={17}/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Estado" value={statusLabel(selected.status)}/><Detail label="Motor" value={engineLabel(selected.engine)}/><Detail label="Cola" value={`${selected.queue_name || queueLabel(selected)}${selected.queue_position ? ` · posición ${selected.queue_position}` : ""}`}/><Detail label="Estado proveedor" value={providerState(selected)}/><Detail label="Origen" value={originLabel(selected)}/><Detail label="Usuario" value={selected.user_id?`#${selected.user_id}`:"Administrador"}/><Detail label="Job remoto" value={selected.provider_job_id || "—"}/><Detail label="Endpoint remoto" value={selected.provider_endpoint_id || "—"}/><Detail label="Intentos de despacho" value={String(selected.dispatch_attempts ?? 0)}/><Detail label="Heartbeat" value={formatDate(selected.heartbeat_at)}/><Detail label="Duración backend" value={formatDuration(selected.duration_ms)}/><Detail label="Tiempo real" value={formatDuration(selected.real_provider_duration_ms)}/><Detail label="Cancelación solicitada" value={selected.cancel_requested?"Sí":"No"}/></div><div className="mt-6"><h3 className="text-sm font-semibold text-white">Pasos</h3><div className="mt-3 space-y-2">{safeSteps(selected).map((step)=><div key={step.step_key} className="rounded-2xl border border-white/6 bg-black/20 p-4"><div className="flex justify-between gap-4"><div><p className="text-sm text-white">{step.step_name}</p><p className="mt-1 text-xs text-zinc-600">{step.step_type} · {step.step_key}</p></div><span className={`h-fit rounded-full border px-2.5 py-1 text-[10px] uppercase ${statusClass(step.status)}`}>{statusLabel(step.status)}</span></div>{step.error&&<p className="mt-3 text-xs text-red-300">{step.error}</p>}</div>)}</div></div><div className="mt-6 grid gap-4 lg:grid-cols-2"><section><h3 className="text-sm font-semibold text-white">Entradas</h3><pre className="mt-3 max-h-64 overflow-auto rounded-2xl border border-white/6 bg-black/30 p-4 text-[11px] leading-5 text-zinc-400">{prettyJson(selected.inputs)}</pre></section><section><h3 className="text-sm font-semibold text-white">Salidas</h3><pre className="mt-3 max-h-64 overflow-auto rounded-2xl border border-white/6 bg-black/30 p-4 text-[11px] leading-5 text-zinc-400">{prettyJson(selected.outputs)}</pre></section></div><div className="mt-6"><h3 className="text-sm font-semibold text-white">Rastreo de tiempos</h3>{timingRows(selected).length?<div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{timingRows(selected).map((row)=><div key={row.label} className="rounded-2xl border border-white/6 bg-black/20 p-4" title={row.hint}><p className="text-[10px] uppercase tracking-wider text-zinc-600">{row.label}</p><p className="mt-2 text-sm font-semibold text-white">{row.value}</p>{row.hint&&<p className="mt-2 text-[10px] leading-4 text-zinc-600">{row.hint}</p>}</div>)}</div>:<p className="mt-3 text-xs text-zinc-600">Esta ejecución todavía no contiene métricas de rastreo detallado.</p>}{transportFiles(selected).length>0&&<div className="mt-5"><h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Archivos únicos del transporte</h4><div className="mt-3 space-y-2">{transportFiles(selected).map((file)=><div key={file.file_id} className="rounded-2xl border border-white/6 bg-black/20 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-mono text-xs text-white">{file.file_id}</p><p className="text-xs text-zinc-500">{formatBytes(file.size_bytes)} · {file.occurrence_count??0} ocurrencia{file.occurrence_count===1?"":"s"}</p></div>{file.filenames.length>0&&<p className="mt-2 text-[11px] text-zinc-500">Nombres: {file.filenames.join(", ")}</p>}{file.node_ids.length>0&&<p className="mt-1 text-[11px] text-zinc-600">Nodos: {file.node_ids.join(", ")}</p>}{file.sha256&&<p className="mt-1 truncate font-mono text-[10px] text-zinc-700" title={file.sha256}>SHA-256: {file.sha256}</p>}<div className="mt-3 space-y-1">{file.paths.map((path)=><p key={path} className="break-all font-mono text-[10px] text-zinc-500">{path}</p>)}</div></div>)}</div></div>}<h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-zinc-500">JSON técnico</h4><pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-white/6 bg-black/30 p-4 text-[11px] leading-5 text-zinc-400">{prettyJson({provider_metrics:selected.provider_metrics ?? {},runtime_metrics:selected.runtime_metrics ?? {}})}</pre></div><div className="mt-6"><h3 className="text-sm font-semibold text-white">Registro</h3><div className="mt-3 max-h-60 space-y-2 overflow-auto rounded-2xl border border-white/6 bg-black/30 p-4 font-mono text-[11px]">{safeLogs(selected).length?safeLogs(selected).map((log,index)=><p key={`${log.timestamp}-${index}`} className={log.level==="error"?"text-red-300":log.level==="warning"?"text-amber-300":"text-zinc-500"}>[{formatDate(log.timestamp)}] {log.message}</p>):<p className="text-zinc-600">Sin eventos registrados.</p>}</div></div></section></div>}
  </div>;
}

function Metric({label,value,icon:Icon}:{label:string;value:number;icon:React.ComponentType<{size?:number}>}){return <article className="luxia-panel rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-600">{label}</p><p className="mt-4 text-2xl font-semibold text-white">{value.toLocaleString("es-MX")}</p></div><div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/15 text-red-400"><Icon size={18}/></div></div></article>}
function Detail({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/6 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 text-sm text-white">{value}</p></div>}
