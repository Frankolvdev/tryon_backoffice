"use client";

import type { GenerationModuleInput } from "@/types/admin-generation-modules";

type Values = Record<string, unknown>;
type Props = { inputs: GenerationModuleInput[]; values: Values; onChange: (values: Values) => void; disabled?: boolean };

export function buildInitialGenerationValues(inputs: GenerationModuleInput[]): Values {
  return Object.fromEntries(inputs.map((input) => [input.key, input.default_value ?? (input.input_type === "boolean" ? false : "")]));
}

export function validateGenerationValues(inputs: GenerationModuleInput[], values: Values): string | null {
  for (const input of inputs) {
    const value = values[input.key];
    if (input.is_required && (value === undefined || value === null || value === "")) return `Completa: ${input.name}.`;
    const rules = input.validation ?? {};
    if (typeof value === "string") {
      if (typeof rules.min_length === "number" && value.length < rules.min_length) return `${input.name} requiere al menos ${rules.min_length} caracteres.`;
      if (typeof rules.max_length === "number" && value.length > rules.max_length) return `${input.name} permite máximo ${rules.max_length} caracteres.`;
    }
    if (typeof value === "number") {
      if (typeof rules.min === "number" && value < rules.min) return `${input.name} debe ser mayor o igual a ${rules.min}.`;
      if (typeof rules.max === "number" && value > rules.max) return `${input.name} debe ser menor o igual a ${rules.max}.`;
    }
  }
  return null;
}

function optionsFor(input: GenerationModuleInput): Array<{ label: string; value: string }> {
  const options = input.validation?.options;
  if (!Array.isArray(options)) return [];
  return options.map((option) => typeof option === "string" ? { label: option, value: option } : ({ label: String((option as any).label ?? (option as any).value), value: String((option as any).value ?? "") }));
}

export function DynamicGenerationForm({ inputs, values, onChange, disabled }: Props) {
  const setValue = (key: string, value: unknown) => onChange({ ...values, [key]: value });
  return <div className="grid gap-4 md:grid-cols-2">
    {[...inputs].sort((a,b)=>a.position-b.position).map((input) => {
      const rules = input.validation ?? {};
      const common = { disabled, required: input.is_required, className: "gm-input" };
      return <label key={input.key} className={input.input_type === "textarea" || input.input_type === "json" || input.input_type === "image" || input.input_type === "file" ? "md:col-span-2" : ""}>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{input.name}{input.is_required ? " *" : ""}</span>
        {input.description && <span className="mb-2 block text-xs text-zinc-600">{input.description}</span>}
        {input.input_type === "boolean" ? <input type="checkbox" checked={Boolean(values[input.key])} onChange={e=>setValue(input.key,e.target.checked)} disabled={disabled} className="h-5 w-5 accent-red-600"/> :
         input.input_type === "select" ? <select {...common} value={String(values[input.key] ?? "")} onChange={e=>setValue(input.key,e.target.value)}><option value="">Selecciona una opción</option>{optionsFor(input).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select> :
         input.input_type === "textarea" ? <textarea {...common} rows={Number(rules.rows ?? 5)} value={String(values[input.key] ?? "")} onChange={e=>setValue(input.key,e.target.value)}/> :
         input.input_type === "json" ? <textarea {...common} rows={7} value={typeof values[input.key] === "string" ? String(values[input.key]) : JSON.stringify(values[input.key] ?? {},null,2)} onChange={e=>setValue(input.key,e.target.value)} className="gm-input font-mono text-xs"/> :
         input.input_type === "image" || input.input_type === "file" ? <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4"><input type="file" disabled={disabled} accept={input.input_type === "image" ? String(rules.accept ?? "image/*") : String(rules.accept ?? "")} onChange={e=>setValue(input.key,e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-400"/>{values[input.key] instanceof File && <div className="mt-3 space-y-2"><p className="text-[11px] text-emerald-300">{(values[input.key] as File).name} · {Math.ceil((values[input.key] as File).size / 1024)} KB</p>{input.input_type === "image" && <img src={URL.createObjectURL(values[input.key] as File)} alt={`Vista previa de ${input.name}`} className="max-h-56 rounded-xl border border-white/10 object-contain"/>}</div>}</div> :
         <input {...common} type={input.input_type === "integer" || input.input_type === "float" ? "number" : "text"} step={input.input_type === "integer" ? 1 : input.input_type === "float" ? "any" : undefined} min={typeof rules.min === "number" ? rules.min : undefined} max={typeof rules.max === "number" ? rules.max : undefined} minLength={typeof rules.min_length === "number" ? rules.min_length : undefined} maxLength={typeof rules.max_length === "number" ? rules.max_length : undefined} placeholder={typeof rules.placeholder === "string" ? rules.placeholder : undefined} value={String(values[input.key] ?? "")} onChange={e=>setValue(input.key,input.input_type === "integer" ? Number.parseInt(e.target.value || "0",10) : input.input_type === "float" ? Number(e.target.value) : e.target.value)}/>} 
      </label>;
    })}
  </div>;
}
