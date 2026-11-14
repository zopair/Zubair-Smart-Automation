import {analyzeRequest} from "./core/request-analyzer.js";
import {registerTool,getTool} from "./core/tool-registry.js";
import {mountTaskManager} from "./tools/task-manager.js";
registerTool({id:"task-manager",label:"إدارة المهام",description:"إدارة مهام محلية على جهازك.",mount:mountTaskManager});
const input=document.querySelector("#request"),button=document.querySelector("#analyze-button"),count=document.querySelector("#char-count"),feedback=document.querySelector("#feedback"),result=document.querySelector("#result"),title=document.querySelector("#result-title"),description=document.querySelector("#result-description"),workspace=document.querySelector("#tool-workspace");
input.addEventListener("input",()=>{count.textContent=`${input.value.length} / 1200`;});
button.addEventListener("click",()=>{
  const analysis=analyzeRequest(input.value);feedback.textContent="";
  if(analysis.intent==="unknown"){feedback.textContent=analysis.description;result.hidden=true;return;}
  result.hidden=false;title.textContent=analysis.label;description.textContent=analysis.description;workspace.replaceChildren();
  const tool=getTool(analysis.intent);
  if(tool)tool.mount(workspace);
  else{const note=document.createElement("p");note.className="coming-soon";note.textContent="تم تحديد نوع الأداة. هذا القالب ضمن مراحل التطوير التالية.";workspace.append(note);}
  result.scrollIntoView({behavior:"smooth",block:"start"});
});
