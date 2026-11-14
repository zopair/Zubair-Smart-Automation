const DEFAULT_KEY="zubair-smart-automation:agent-workflows:v1";
function browserStorage(){try{return globalThis.localStorage;}catch{return null;}}
function clone(value){return JSON.parse(JSON.stringify(value));}
function requiredText(value,label,max=120){const text=String(value??"").trim();if(!text)throw new TypeError(`${label} is required.`);if(text.length>max)throw new RangeError(`${label} is too long.`);return text;}
function safeObject(value,label){
 if(value===undefined)return {};
 if(!value||typeof value!=="object"||Array.isArray(value))throw new TypeError(`${label} must be an object.`);
 const json=JSON.stringify(value);if(!json||json.length>10000)throw new RangeError(`${label} is too large or not serializable.`);
 return JSON.parse(json);
}
export function createAgentWorkflowEngine({storage=browserStorage(),key=DEFAULT_KEY,tools=[],idFactory=()=>globalThis.crypto.randomUUID(),now=()=>new Date().toISOString()}={}){
 if(!storage||typeof storage.getItem!=="function"||typeof storage.setItem!=="function")throw new TypeError("A Storage-compatible object is required.");
 const registry=new Map();
 for(const tool of tools){
  if(!tool||typeof tool.id!=="string"||!/^[a-z][a-z0-9.-]{1,79}$/.test(tool.id)||typeof tool.execute!=="function"||!["read","write"].includes(tool.risk))throw new TypeError("Every workflow tool needs a valid id, risk and execute function.");
  if(registry.has(tool.id))throw new Error(`Duplicate workflow tool: ${tool.id}`);
  registry.set(tool.id,Object.freeze({id:tool.id,risk:tool.risk,execute:tool.execute}));
 }
 function read(){try{const value=JSON.parse(storage.getItem(key)??"{}");return {runs:Array.isArray(value.runs)?value.runs:[],events:Array.isArray(value.events)?value.events:[]};}catch{return {runs:[],events:[]};}}
 function write(state){state.events=state.events.slice(-500);storage.setItem(key,JSON.stringify(state));}
 function event(state,run,type,detail={}){state.events.push({id:String(idFactory()),runId:run.id,type,at:now(),detail:safeObject(detail,"Event detail")});}
 function findRun(state,id){const run=state.runs.find(item=>item.id===id);if(!run)throw new Error("Workflow run not found.");return run;}
 return Object.freeze({
  listTools(){return [...registry.values()].map(({id,risk})=>({id,risk}));},
  createRun({title,steps}={}){
   const cleanTitle=requiredText(title,"Workflow title");
   if(!Array.isArray(steps)||steps.length<1||steps.length>20)throw new RangeError("A workflow must contain between 1 and 20 steps.");
   const planned=steps.map((step,index)=>{
    const tool=registry.get(step?.toolId);if(!tool)throw new Error(`Tool is not registered in the allowlist: ${step?.toolId??"unknown"}`);
    return {id:`step-${index+1}`,toolId:tool.id,risk:tool.risk,input:safeObject(step.input,"Step input"),status:"pending",result:null,error:null};
   });
   const state=read(),run={id:String(idFactory()),title:cleanTitle,createdAt:now(),status:"awaiting_approval",steps:planned,error:null,approvedAt:null,completedAt:null};
   state.runs.unshift(run);event(state,run,"workflow.created",{stepCount:planned.length,writeSteps:planned.filter(step=>step.risk==="write").length});write(state);return clone(run);
  },
  getRun(id){const run=read().runs.find(item=>item.id===id);return run?clone(run):null;},
  listRuns(){return clone(read().runs);},
  listEvents(runId){const events=read().events;return clone(runId?events.filter(item=>item.runId===runId):events);},
  approve(id,{approvedBy="user"}={}){
   const state=read(),run=findRun(state,id);if(run.status!=="awaiting_approval")throw new Error("Workflow is not awaiting approval.");
   run.status="approved";run.approvedAt=now();event(state,run,"workflow.approved",{approvedBy:String(approvedBy).slice(0,80)});write(state);return clone(run);
  },
  reject(id,reason="Rejected by user"){
   const state=read(),run=findRun(state,id);if(run.status!=="awaiting_approval")throw new Error("Workflow is not awaiting approval.");
   run.status="rejected";run.error=String(reason).slice(0,500);event(state,run,"workflow.rejected");write(state);return clone(run);
  },
  async execute(id){
   const state=read(),run=findRun(state,id);if(run.status!=="approved")throw new Error("Explicit workflow approval is required before execution.");
   run.status="running";event(state,run,"workflow.started");write(state);
   for(const step of run.steps){
    const tool=registry.get(step.toolId);if(!tool){run.status="failed";run.error="Allowlisted tool is no longer registered.";step.status="failed";step.error=run.error;event(state,run,"step.failed",{stepId:step.id});write(state);return clone(run);}
    step.status="running";event(state,run,"step.started",{stepId:step.id,toolId:step.toolId});write(state);
    try{
     const output=await tool.execute(clone(step.input),{runId:run.id,stepId:step.id});
     const serialized=JSON.stringify(output??null);if(serialized.length>20000)throw new RangeError("Tool output exceeded the 20 KB limit.");
     step.result=JSON.parse(serialized);step.status="completed";event(state,run,"step.completed",{stepId:step.id,toolId:step.toolId});
    }catch(error){
     step.status="failed";step.error=String(error?.message??"Tool execution failed.").slice(0,500);run.status="failed";run.error=step.error;event(state,run,"step.failed",{stepId:step.id,toolId:step.toolId});write(state);return clone(run);
    }
    write(state);
   }
   run.status="completed";run.completedAt=now();event(state,run,"workflow.completed",{stepCount:run.steps.length});write(state);return clone(run);
  }
 });
}
