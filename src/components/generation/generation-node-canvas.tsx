"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background, Controls, Handle, MiniMap, Position, ReactFlow,
  addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import { Code2, Power, PowerOff, Workflow } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { GenerationModule, GenerationModuleStep } from "@/types/admin-generation-modules";

type Port = { key: string; label: string; type: string; path: string };
type CanvasData = { title: string; subtitle: string; kind: "input"|"output"|"workflow"|"python"; enabled: boolean; inputs: Port[]; outputs: Port[]; onEdit?:()=>void };
type FlowNode = Node<CanvasData>;

function NodeCard({ data, selected }: NodeProps<FlowNode>) {
  const icon = data.kind === "workflow" ? <Workflow size={17}/> : data.kind === "python" ? <Code2 size={17}/> : null;
  return <div className={`min-w-[270px] rounded-xl border bg-[#111216] shadow-2xl ${selected?"border-red-500":"border-white/15"}`}>
    <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${data.kind==="workflow"?"bg-violet-500/15":data.kind==="python"?"bg-red-500/15":"bg-sky-500/10"}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{data.title}</div>
      <span className={data.enabled?"text-emerald-400":"text-zinc-600"}>{data.enabled?<Power size={15}/>:<PowerOff size={15}/>}</span>
    </div>
    <div className="px-3 py-2 text-[11px] text-zinc-500">{data.subtitle}</div>
    <div className="grid grid-cols-2 gap-5 px-3 pb-3">
      <div className="space-y-2">{data.inputs.map((p,i)=><div key={p.key} className="relative text-left text-[11px] text-zinc-300"><Handle id={`in:${p.key}`} type="target" position={Position.Left} style={{top:96+i*28}}/><span>{p.label}</span><small className="ml-1 text-zinc-600">{p.type}</small></div>)}</div>
      <div className="space-y-2 text-right">{data.outputs.map((p,i)=><div key={p.key} className="relative text-[11px] text-zinc-300"><span>{p.label}</span><small className="ml-1 text-zinc-600">{p.type}</small><Handle id={`out:${p.key}`} type="source" position={Position.Right} style={{top:96+i*28}}/></div>)}</div>
    </div>
    {data.onEdit&&<button onClick={data.onEdit} className="w-full border-t border-white/10 py-2 text-xs text-zinc-400 hover:text-white">Editar nodo</button>}
  </div>;
}

const nodeTypes = { pipeline: NodeCard };

function stepInputs(step:GenerationModuleStep):Port[]{
  if(step.step_type==="workflow") return ((step.configuration?.input_bindings??[]) as any[]).map((b:any)=>({key:`${b.node_id}.${b.input_field}`,label:b.input_field,type:"auto",path:b.source_path??b.module_input_key??""}));
  return Object.entries(step.input_mapping??{}).map(([key,value])=>({key,label:key,type:"auto",path:String(value)}));
}
function stepOutputs(step:GenerationModuleStep):Port[]{
  if(step.step_type==="workflow") return ((step.configuration?.output_bindings??[]) as any[]).map((b:any)=>({key:b.module_output_key,label:b.module_output_key,type:"image",path:`${step.key}.${b.module_output_key}`}));
  return Object.keys(step.output_mapping??{}).map(key=>({key,label:key,type:"auto",path:`${step.key}.${key}`}));
}

export function GenerationNodeCanvas({module,onModule,onEdit}:{module:GenerationModule;onModule:(m:GenerationModule)=>void;onEdit:(s:GenerationModuleStep)=>void}){
  const buildNodes=useCallback(()=>{
    const ordered=[...module.steps].sort((a,b)=>a.position-b.position);
    const nodes:FlowNode[]=[{id:"module-inputs",type:"pipeline",position:{x:40,y:140},data:{title:"Entradas del módulo",subtitle:"Formulario automático",kind:"input",enabled:true,inputs:[],outputs:module.inputs.map(i=>({key:i.key,label:i.name||i.key,type:i.input_type,path:i.key}))}}];
    ordered.forEach((s,index)=>nodes.push({id:`step:${s.id}`,type:"pipeline",position:{x:390+index*350,y:100+(index%2)*120},data:{title:s.name,subtitle:`${s.key} · ${s.step_type}`,kind:s.step_type,enabled:s.is_enabled,inputs:stepInputs(s),outputs:stepOutputs(s),onEdit:()=>onEdit(s)}}));
    nodes.push({id:"module-outputs",type:"pipeline",position:{x:390+ordered.length*350,y:140},data:{title:"Salidas publicadas",subtitle:"Resultado del módulo",kind:"output",enabled:true,inputs:module.outputs.map(o=>({key:o.key,label:o.name||o.key,type:o.output_type,path:o.source_path??o.key})),outputs:[]}});
    return nodes;
  },[module,onEdit]);
  const buildEdges=useCallback(()=>{
    const edges:Edge[]=[];
    for(const s of module.steps){
      for(const p of stepInputs(s)){
        if(!p.path) continue;
        const [prefix,key]=p.path.includes(".")?p.path.split(".",2):["module-inputs",p.path];
        const source=prefix==="module-inputs"?"module-inputs":`step:${module.steps.find(x=>x.key===prefix)?.id??"missing"}`;
        if(source.includes("missing")) continue;
        edges.push({id:`${source}-${s.id}-${p.key}`,source,target:`step:${s.id}`,sourceHandle:`out:${key}`,targetHandle:`in:${p.key}`,animated:true});
      }
    }
    return edges;
  },[module]);
  const [nodes,setNodes,onNodesChange]=useNodesState<FlowNode>(buildNodes());
  const [edges,setEdges,onEdgesChange]=useEdgesState(buildEdges());
  useEffect(()=>{setNodes(buildNodes());setEdges(buildEdges())},[buildNodes,buildEdges,setNodes,setEdges]);
  const onConnect=useCallback(async(connection:Connection)=>{
    if(!connection.sourceHandle||!connection.targetHandle||!connection.target?.startsWith("step:")) return;
    const target=module.steps.find(s=>String(s.id)===connection.target!.split(":")[1]); if(!target) return;
    const sourceNode=connection.source==="module-inputs"?null:module.steps.find(s=>String(s.id)===connection.source!.split(":")[1]);
    const sourceKey=connection.sourceHandle.replace("out:","");
    const targetKey=connection.targetHandle.replace("in:","");
    const sourcePath=sourceNode?`${sourceNode.key}.${sourceKey}`:sourceKey;
    try{
      let updated:GenerationModule;
      if(target.step_type==="python"){
        updated=await browserApiRequest(`/api/admin/generation-modules/${module.id}/steps/${target.id}/python`,{method:"PATCH",body:JSON.stringify({input_mapping:{...(target.input_mapping??{}),[targetKey]:sourcePath}})});
      }else{
        const [node_id,input_field]=targetKey.split(".",2);
        const existing=((target.configuration?.input_bindings??[]) as any[]).filter((b:any)=>`${b.node_id}.${b.input_field}`!==targetKey);
        updated=await browserApiRequest(`/api/admin/generation-modules/${module.id}/steps/${target.id}/workflow-bindings`,{method:"PATCH",body:JSON.stringify({input_bindings:[...existing,{source_path:sourcePath,node_id,input_field}],output_bindings:target.configuration?.output_bindings??[]})});
      }
      setEdges(es=>addEdge({...connection,animated:true},es)); onModule(updated); toast.success("Conexión guardada.");
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar la conexión.")}
  },[module,onModule,setEdges]);
  return <div className="h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-[#08090c]">
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView deleteKeyCode={null}>
      <Background gap={20} size={1}/><MiniMap pannable zoomable/><Controls/>
    </ReactFlow>
  </div>;
}
