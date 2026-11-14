import {createTaskStore} from "../core/task-store.js";

export function mountTaskManager(root) {
  let store;
  try { store=createTaskStore(); }
  catch { const message=document.createElement("p");message.className="storage-note";message.textContent="التخزين المحلي غير متاح في هذا المتصفح أو لهذه الصفحة. فعّل صلاحية التخزين ثم أعد المحاولة.";root.replaceChildren(message);return; }
  const section=document.createElement("section");
  section.className="task-form";
  section.innerHTML=`<form class="task-entry"><label class="sr-only" for="task-title">مهمة جديدة</label><input id="task-title" name="title" maxlength="160" required placeholder="اكتب اسم المهمة..."><button class="primary-button" type="submit">إضافة</button></form><div class="task-toolbar"><span class="task-count" aria-live="polite"></span><button class="export-tasks" type="button">تصدير JSON</button></div><ul class="task-list" aria-label="قائمة المهام"></ul><p class="storage-note">تُحفظ المهام على هذا الجهاز فقط. لا يتم إرسالها إلى خادم.</p>`;
  const form=section.querySelector("form"),list=section.querySelector(".task-list"),count=section.querySelector(".task-count");
  function render() {
    const tasks=store.list();list.replaceChildren();
    count.textContent=`إجمالي المهام: ${tasks.length} · المكتملة: ${tasks.filter(task=>task.completed).length}`;
    for(const task of tasks) {
      const item=document.createElement("li");item.className="task-item";
      const label=document.createElement("label");label.className="task-label";
      const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.checked=task.completed;checkbox.setAttribute("aria-label",`تحديد ${task.title} كمكتملة`);
      checkbox.addEventListener("change",()=>{store.setCompleted(task.id,checkbox.checked);render();});
      const text=document.createElement("span");text.textContent=task.title;if(task.completed)text.className="is-complete";
      label.append(checkbox,text);
      const remove=document.createElement("button");remove.type="button";remove.className="remove-task";remove.textContent="حذف";remove.setAttribute("aria-label",`حذف المهمة ${task.title}`);
      remove.addEventListener("click",()=>{store.remove(task.id);render();});
      item.append(label,remove);list.append(item);
    }
    if(!tasks.length){const empty=document.createElement("li");empty.className="empty-state";empty.textContent="لا توجد مهام بعد.";list.append(empty);}
  }
  form.addEventListener("submit",event=>{event.preventDefault();const input=form.elements.title;try{store.create({title:input.value});input.value="";render();input.focus();}catch(error){input.setCustomValidity(error.message);input.reportValidity();}});
  form.elements.title.addEventListener("input",event=>event.currentTarget.setCustomValidity(""));
  section.querySelector(".export-tasks").addEventListener("click",()=>{
    const blob=new Blob([store.exportJson()],{type:"application/json"});
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download="zubair-tasks.json";anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  root.replaceChildren(section);render();
}
