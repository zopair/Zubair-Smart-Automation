import {searchSourceCatalog} from "../core/source-catalog.js";
export function mountSourceCatalog(root){
 const section=document.createElement("section");section.className="source-catalog";
 const search=document.createElement("input");search.type="search";search.placeholder="ابحث باسم الأداة أو المستودع أو الترخيص";search.setAttribute("aria-label",search.placeholder);
 const filters=document.createElement("div");filters.className="source-filters";
 const category=makeSelect("التصنيف",[["all","كل التصنيفات"],["agent-builder","بناء الوكلاء"],["workflow-automation","أتمتة التدفقات"],["browser-inference","ذكاء اصطناعي داخل المتصفح"],["media-generation","توليد الوسائط"],["social-publishing","النشر الاجتماعي"]]);
 const risk=makeSelect("مخاطر الترخيص",[["all","كل المستويات"],["low","منخفض"],["medium","متوسط"],["high","مرتفع"]]);
 filters.append(category,risk);
 const count=document.createElement("p");count.className="storage-note";count.setAttribute("aria-live","polite");
 const list=document.createElement("div");list.className="source-list";
 function render(){
  const entries=searchSourceCatalog({query:search.value,category:category.querySelector("select").value,licenseRisk:risk.querySelector("select").value});
  list.replaceChildren();count.textContent=`عدد النتائج: ${entries.length}`;
  for(const entry of entries){
   const card=document.createElement("article");card.className="source-card";
   const title=document.createElement("h3");title.textContent=entry.name;
   const repo=document.createElement("p");repo.className="source-repo";repo.textContent=entry.repository;
   const summary=document.createElement("p");summary.textContent=entry.summary;
   const license=document.createElement("p");license.textContent=`الترخيص: ${entry.license}`;
   const scope=document.createElement("p");scope.textContent=entry.licenseScope;
   const fit=document.createElement("p");fit.textContent=`ملاءمة المنصة: ${entry.clientFit}`;
   const notes=document.createElement("ul");for(const note of entry.notes){const li=document.createElement("li");li.textContent=note;notes.append(li);}
   const meta=document.createElement("small");meta.textContent=`مراجعة ${entry.reviewedAt} · ${entry.auditStatus}`;
   const link=document.createElement("a");link.href=entry.url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="فتح المستودع الرسمي";
   const licenseLink=document.createElement("a");licenseLink.href=entry.licenseUrl;licenseLink.target="_blank";licenseLink.rel="noopener noreferrer";licenseLink.textContent="فتح ملف الترخيص";
   card.append(title,repo,summary,license,scope,fit,notes,meta,link,licenseLink);list.append(card);
  }
  if(!entries.length){const empty=document.createElement("p");empty.className="empty-state";empty.textContent="لا توجد نتائج مطابقة.";list.append(empty);}
 }
 search.addEventListener("input",render);category.querySelector("select").addEventListener("change",render);risk.querySelector("select").addEventListener("change",render);
 section.append(search,filters,count,list);root.replaceChildren(section);render();
 function makeSelect(label,options){const wrap=document.createElement("label");wrap.className="source-filter";const caption=document.createElement("span");caption.textContent=label;const select=document.createElement("select");select.setAttribute("aria-label",label);for(const [value,text] of options){const option=document.createElement("option");option.value=value;option.textContent=text;select.append(option);}wrap.append(caption,select);return wrap;}
}
