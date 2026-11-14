import {createAgentWorkflowEngine} from "../core/agent-workflow.js";
import {createTaskStore} from "../core/task-store.js";
export function mountAgentWorkflow(root){
 let engine;try{engine=createAgentWorkflowEngine({tools:[
  {id:"text.normalize",risk:"read",execute:({text=""}={})=>({normalizedText:String(text).replace(/\r\n?/g,"\n").replace(/[\t ]+/g," ").replace(/\n{3,}/g,"\n\n").trim()})},
  {id:"tasks.create",risk:"write",execute:({title}={})=>createTaskStore().create({title})}
 ]});}catch{const note=document.createElement("p");note.className="storage-note";note.textContent="التخزين المحلي غير متاح؛ لا يمكن تشغيل مركز سير العمل في هذا المتصفح.";root.replaceChildren(note);return;}
 const section=document.createElement("section");section.className="agent-workflow";
 const form=document.createElement("form");form.className="agent-form";
 const workflowTitle=field("اسم سير العمل","workflowTitle",120),sourceText=field("النص المراد تنظيمه","sourceText",1200,"textarea"),taskTitle=field("عنوان المهمة التي ستُنشأ بعد الموافقة","taskTitle",160);
 const submit=document.createElement("button");submit.type="submit";submit.className="primary-button";submit.textContent="إعداد خطة سير العمل";
 form.append(workflowTitle,sourceText,taskTitle,submit);
 const plan=document.createElement("section");plan.className="agent-plan";plan.hidden=true;
 const details=document.createElement("div");details.className="agent-plan-details";
 const approve=document.createElement("button");approve.type="button";approve.className="primary-button";approve.textContent="اعتماد الخطة وتنفيذها";
 const status=document.createElement("p");status.className="storage-note";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="لا يتم تنفيذ أي خطوة قبل اعتمادك الصريح. التنفيذ محلي ويقتصر على الأدوات المسموح بها.";
 const history=document.createElement("div");history.className="agent-history";
 let activeRunId=null;
 form.addEventListener("submit",event=>{event.preventDefault();try{
  const run=engine.createRun({title:workflowTitle.value,steps:[{toolId:"text.normalize",input:{text:sourceText.value}},{toolId:"tasks.create",input:{title:taskTitle.value}}]});
  activeRunId=run.id;plan.hidden=false;details.replaceChildren();const heading=document.createElement("h3");heading.textContent=run.title;const state=document.createElement("p");state.textContent="الحالة: في انتظار الموافقة";const list=document.createElement("ol");
  for(const step of run.steps){const item=document.createElement("li");item.textContent=`${step.toolId} · ${step.risk==="write"?"يتطلب كتابة محلية":"قراءة/معالجة محلية"}`;list.append(item);}
  details.append(heading,state,list);status.textContent="راجع الخطوات أعلاه. لن يبدأ التنفيذ إلا عند الضغط على زر الاعتماد.";approve.disabled=false;renderHistory();
 }catch(error){status.textContent=error.message;}});
 approve.addEventListener("click",async()=>{if(!activeRunId)return;approve.disabled=true;try{
  engine.approve(activeRunId,{approvedBy:"user"});
  status.textContent="تم اعتماد الخطة. جارٍ تنفيذ الخطوات المسموح بها...";
  const result=await engine.execute(activeRunId);
  const summary=document.createElement("pre");summary.className="agent-output";summary.textContent=result.status==="completed"?result.steps.map(step=>step.toolId+": "+JSON.stringify(step.result)).join("\n"):`تعذر إكمال الخطة: ${result.error??result.status}`;
  details.append(summary);status.textContent=result.status==="completed"?"اكتمل سير العمل. راجع سجل المهام المحلي.":"توقف سير العمل عند خطوة فاشلة. راجع تفاصيل الخطأ.";renderHistory();
 }catch(error){status.textContent=error.message;approve.disabled=false;}});
 section.append(form,plan,status,history);plan.append(details,approve);root.replaceChildren(section);renderHistory();
 function field(placeholder,name,max,type="text"){const el=document.createElement(type==="textarea"?"textarea":"input");if(type!=="textarea")el.type=type;el.name=name;el.placeholder=placeholder;el.setAttribute("aria-label",placeholder);el.maxLength=max;el.required=true;return el;}
 function renderHistory(){history.replaceChildren();const heading=document.createElement("h3");heading.textContent="سجل التدقيق المحلي";history.append(heading);for(const run of engine.listRuns().slice(0,5)){const row=document.createElement("article");row.className="agent-audit-row";const item=document.createElement("p");item.textContent=`${run.title} — ${run.status}`;const events=document.createElement("small");events.textContent=engine.listEvents(run.id).map(entry=>entry.type).join(" · ");row.append(item,events);history.append(row);}}
}
