const STORAGE_KEY="zubair-smart-automation:tasks:v1";
function readTasks() {
  try { const value=JSON.parse(localStorage.getItem(STORAGE_KEY)??"[]"); return Array.isArray(value)?value:[]; }
  catch { return []; }
}
function saveTasks(tasks) { localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks)); }
export function mountTaskManager(root) {
  const form=document.createElement("form"); form.className="task-form";
  form.innerHTML=`<label for="task-title">مهمة جديدة</label><div class="task-entry"><input id="task-title" name="title" maxlength="160" required placeholder="اكتب اسم المهمة..."><button class="primary-button" type="submit">إضافة</button></div><ul class="task-list" aria-label="قائمة المهام"></ul><p class="storage-note">تُحفظ المهام على هذا الجهاز فقط باستخدام Local Storage.</p>`;
  const list=form.querySelector(".task-list");
  function render() {
    list.replaceChildren();
    for(const task of readTasks()) {
      const item=document.createElement("li"); item.className="task-item";
      const label=document.createElement("span"); label.textContent=task.title;
      const remove=document.createElement("button"); remove.type="button"; remove.className="remove-task"; remove.textContent="حذف"; remove.setAttribute("aria-label",`حذف المهمة ${task.title}`);
      remove.addEventListener("click",()=>{saveTasks(readTasks().filter(entry=>entry.id!==task.id));render();});
      item.append(label,remove);list.append(item);
    }
    if(!list.childElementCount){const empty=document.createElement("li");empty.className="empty-state";empty.textContent="لا توجد مهام بعد.";list.append(empty);}
  }
  form.addEventListener("submit",event=>{
    event.preventDefault();const input=form.elements.title;const title=input.value.trim();if(!title)return;
    const tasks=readTasks();tasks.unshift({id:crypto.randomUUID(),title,createdAt:new Date().toISOString()});saveTasks(tasks);input.value="";render();
  });
  root.replaceChildren(form);render();
}
