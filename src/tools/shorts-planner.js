import {createShortPlan,buildShortPlanText} from "../core/shorts-planner.js";
export function mountShortsPlanner(root){
  const section=document.createElement("section");section.className="shorts-planner";
  const form=document.createElement("form");form.className="shorts-form";
  const topic=input("موضوع الفيديو","topic",120),audience=input("الجمهور المستهدف","audience",120),goal=input("الهدف","goal",80),cta=input("الدعوة إلى الإجراء","cta",160),keywords=input("كلمات مفتاحية مفصولة بفواصل","keywords",240);
  const platform=select("المنصة","platform",[["instagram","Instagram Reels"],["tiktok","TikTok"],["youtube-shorts","YouTube Shorts"],["facebook","Facebook Reels"]]);
  const duration=select("المدة بالثواني","duration",[["15","15 ثانية"],["30","30 ثانية"],["45","45 ثانية"],["60","60 ثانية"],["90","90 ثانية"],["120","120 ثانية"]]);
  const tone=select("أسلوب الأداء","tone",[["professional","احترافي"],["friendly","ودود"],["energetic","حيوي"],["educational","تعليمي"]]);
  const submit=document.createElement("button");submit.type="submit";submit.className="primary-button";submit.textContent="إنشاء مخطط الفيديو";
  form.append(topic,audience,goal,platform,duration,tone,cta,keywords,submit);
  const result=document.createElement("section");result.className="shorts-result";result.hidden=true;
  const output=document.createElement("pre");output.className="shorts-output";
  const copy=document.createElement("button");copy.type="button";copy.className="export-tasks";copy.textContent="تنزيل السيناريو TXT";
  copy.addEventListener("click",()=>{const blob=new Blob([output.textContent],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="zubair-short-video-plan.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const status=document.createElement("p");status.className="storage-note";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  form.addEventListener("submit",event=>{event.preventDefault();try{const plan=createShortPlan({topic:topic.value,audience:audience.value,goal:goal.value,platform:platform.value,duration:Number(duration.value),tone:tone.value,cta:cta.value,keywords:keywords.value.split(",")});output.textContent=buildShortPlanText(plan);result.hidden=false;status.textContent="تم إنشاء مخطط إنتاج قابل للتعديل. راجع المعلومات قبل النشر.";result.scrollIntoView({behavior:"smooth",block:"nearest"});}catch(error){status.textContent=error.message;}});
  result.append(output,copy);section.append(form,status,result);root.replaceChildren(section);
  function input(placeholder,name,max){const el=document.createElement("input");el.name=name;el.placeholder=placeholder;el.setAttribute("aria-label",placeholder);el.maxLength=max;el.required=["topic","audience"].includes(name);return el;}
  function select(label,name,options){const wrap=document.createElement("label");wrap.className="shorts-field";const caption=document.createElement("span");caption.textContent=label;const el=document.createElement("select");el.name=name;el.setAttribute("aria-label",label);for(const [value,text] of options){const option=document.createElement("option");option.value=value;option.textContent=text;el.append(option);}wrap.append(caption,el);return wrap;}
}
