const styles=`
:root{font-family:Tahoma,Arial,sans-serif;color:#f4f1eb;background:#101014;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;padding:28px 16px;background:radial-gradient(ellipse at top,#28231b,#101014 42rem);min-height:100vh}
main{width:min(680px,100%);margin:6vh auto;background:#19191f;border:1px solid #38343a;border-radius:16px;padding:clamp(20px,5vw,36px)}
h1{font-size:clamp(24px,5vw,34px);margin:0 0 8px;color:#d6b36a}.intro,.notice{color:#aaa6a0;line-height:1.8;font-size:13px}
form{display:flex;gap:9px;margin-top:24px}input[type=text]{min-width:0;flex:1;background:#101014;border:1px solid #49434a;border-radius:8px;padding:13px;color:#fff;font:inherit}
button{border:0;border-radius:8px;padding:11px 16px;background:#d6b36a;color:#17130c;font:700 13px Tahoma,Arial,sans-serif;cursor:pointer}
ul{list-style:none;padding:0;margin:20px 0;display:grid;gap:8px}
li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;background:#101014;border:1px solid #343039;border-radius:8px}
label{display:flex;align-items:center;gap:10px;min-width:0;overflow-wrap:anywhere}input[type=checkbox]{accent-color:#d6b36a;width:17px;height:17px}
.done{text-decoration:line-through;color:#888}.remove{background:transparent;color:#efaaa0;padding:6px 8px}
.notice{border-top:1px solid #343039;padding-top:14px;margin-top:18px}
`;
const script=`
const KEY="zubair-smart-automation:standalone-tasks:v1";
const form=document.querySelector("#task-form"),field=document.querySelector("#task-title"),list=document.querySelector("#tasks"),status=document.querySelector("#status");
let memory=[];
function load(){try{const value=JSON.parse(localStorage.getItem(KEY)??"[]");return Array.isArray(value)?value:memory;}catch{return memory;}}
function save(tasks){memory=tasks;try{localStorage.setItem(KEY,JSON.stringify(tasks));status.textContent="يتم حفظ المهام محلياً في هذا المتصفح.";}catch{status.textContent="التخزين الدائم غير متاح؛ ستظل المهام الحالية في الذاكرة حتى إغلاق الصفحة.";}}
function render(){
  list.replaceChildren();
  const tasks=load();
  for(const task of tasks){
    const item=document.createElement("li"),label=document.createElement("label"),check=document.createElement("input"),title=document.createElement("span"),remove=document.createElement("button");
    check.type="checkbox";check.checked=Boolean(task.completed);check.setAttribute("aria-label","تحديد المهمة كمكتملة");
    title.textContent=task.title;if(task.completed)title.className="done";
    check.addEventListener("change",()=>{save(load().map(row=>row.id===task.id?{...row,completed:check.checked}:row));render();});
    label.append(check,title);remove.type="button";remove.className="remove";remove.textContent="حذف";
    remove.addEventListener("click",()=>{save(load().filter(row=>row.id!==task.id));render();});
    item.append(label,remove);list.append(item);
  }
  if(!tasks.length){const empty=document.createElement("li");empty.textContent="لا توجد مهام بعد.";list.append(empty);}
}
form.addEventListener("submit",event=>{
  event.preventDefault();const title=field.value.trim();if(!title){field.focus();return;}
  const id=globalThis.crypto?.randomUUID?.()??String(Date.now())+"-"+String(Math.random()).slice(2);
  save([{id,title,completed:false},...load()]);field.value="";render();field.focus();
});
render();
`;
export function buildTaskManagerHtml(){
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101014">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; img-src data:; base-uri 'none'; form-action 'none'">
<title>مدير المهام الذكي</title>
<style>${styles}</style>
</head>
<body>
<main>
<h1>مدير المهام الذكي</h1>
<p class="intro">أضف مهامك، تابع إنجازها، واحتفظ ببياناتك محلياً على هذا الجهاز.</p>
<form id="task-form"><label class="sr-only" for="task-title">مهمة جديدة</label><input id="task-title" name="title" type="text" maxlength="160" required placeholder="اكتب المهمة هنا"><button type="submit">إضافة مهمة</button></form>
<ul id="tasks" aria-label="قائمة المهام"></ul>
<p id="status" class="notice" role="status" aria-live="polite">تُحفظ البيانات محلياً ولا يتم إرسالها إلى خادم.</p>
</main>
<script>${script}</script>
</body>
</html>`;
}
