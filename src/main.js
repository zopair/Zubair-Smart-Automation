import {analyzeRequest} from "./core/request-analyzer.js";
import {registerTool,getTool} from "./core/tool-registry.js";
import {mountTaskManager} from "./tools/task-manager.js";
import {buildTaskManagerHtml} from "./tools/task-manager-export.js";
import {mountMiniStore} from "./tools/mini-store.js";
import {buildMiniStoreHtml} from "./tools/mini-store-export.js";
import {mountShortsPlanner} from "./tools/shorts-planner.js";
import {buildShortsPlannerHtml} from "./tools/shorts-planner-export.js";
import {mountSourceCatalog} from "./tools/source-catalog.js";
import {buildSourceCatalogHtml} from "./tools/source-catalog-export.js";
import {mountAgentWorkflow} from "./tools/agent-workflow.js";
registerTool({id:"task-manager",label:"إدارة المهام",description:"إدارة مهام محلية على جهازك.",mount:mountTaskManager,exportHtml:buildTaskManagerHtml});
registerTool({id:"mini-store",label:"متجر مصغر",description:"كتالوج منتجات وسلة وطلبات واتساب مع تخزين محلي.",mount:mountMiniStore,exportHtml:buildMiniStoreHtml});
registerTool({id:"shorts-content",label:"محتوى الفيديو القصير",description:"تخطيط سيناريو فيديو قصير مع تقسيم زمني ووسوم.",mount:mountShortsPlanner,exportHtml:buildShortsPlannerHtml});
registerTool({id:"source-catalog",label:"كتالوج الأدوات والمصادر",description:"البحث في مصادر تقنية مدققة مبدئياً مع بيان التراخيص والمخاطر.",mount:mountSourceCatalog,exportHtml:buildSourceCatalogHtml});
registerTool({id:"agent-workflow",label:"مركز سير عمل الوكلاء",description:"تخطيط خطوات محلية مسموح بها تتطلب موافقة قبل التنفيذ مع سجل تدقيق.",mount:mountAgentWorkflow});
const input=document.querySelector("#request"),button=document.querySelector("#analyze-button"),count=document.querySelector("#char-count"),feedback=document.querySelector("#feedback"),result=document.querySelector("#result"),title=document.querySelector("#result-title"),description=document.querySelector("#result-description"),workspace=document.querySelector("#tool-workspace"),aiPlanButton=document.querySelector("#ai-plan-button"),aiPlanOutput=document.querySelector("#ai-plan-output");
input.addEventListener("input",()=>{count.textContent=`${input.value.length} / 1200`;aiPlanOutput.hidden=true;});
fetch("./api/health").then(response=>response.ok?response.json():null).then(health=>{if(health?.available)aiPlanButton.hidden=false;}).catch(()=>{});
aiPlanButton.addEventListener("click",async()=>{if(!input.value.trim()){feedback.textContent="اكتب وصف الأداة أولاً.";return;}aiPlanButton.disabled=true;feedback.textContent="جارٍ إعداد مواصفات الأداة عبر الخادم...";try{const response=await fetch("./api/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({task:"tool-spec",payload:{description:input.value.trim()}})});const body=await response.json();if(!response.ok)throw new Error(body.error??"تعذر إعداد المواصفات.");aiPlanOutput.textContent=body.text;aiPlanOutput.hidden=false;feedback.textContent="هذه مواصفات أولية؛ راجعها واعتمدها قبل التنفيذ.";}catch(error){feedback.textContent=error.message;}finally{aiPlanButton.disabled=false;}});
button.addEventListener("click",()=>{
  const analysis=analyzeRequest(input.value);feedback.textContent="";
  if(analysis.intent==="unknown"){feedback.textContent=analysis.description;result.hidden=true;return;}
  result.hidden=false;title.textContent=analysis.label;description.textContent=analysis.description;workspace.replaceChildren();
  const tool=getTool(analysis.intent);
  if(tool){
    tool.mount(workspace);
    if(typeof tool.exportHtml==="function"){
      const exportButton=document.createElement("button");exportButton.type="button";exportButton.className="primary-button standalone-export";exportButton.textContent="تنزيل الأداة كملف HTML مستقل";
      exportButton.addEventListener("click",()=>{const blob=new Blob([tool.exportHtml()],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=`zubair-${tool.id}.html`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
      workspace.append(exportButton);
    }
  } else{const note=document.createElement("p");note.className="coming-soon";note.textContent="تم تحديد نوع الأداة. هذا القالب ضمن مراحل التطوير التالية.";workspace.append(note);}
  result.scrollIntoView({behavior:"smooth",block:"start"});
});
