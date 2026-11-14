const DEFAULT_KEY="zubair-smart-automation:tasks:v1";

export function createTaskStore({storage=globalThis.localStorage,key=DEFAULT_KEY,idFactory=()=>globalThis.crypto.randomUUID(),now=()=>new Date().toISOString()}={}) {
  if(!storage || typeof storage.getItem!=="function" || typeof storage.setItem!=="function") throw new TypeError("A Storage-compatible object is required.");
  function read() {
    try {
      const parsed=JSON.parse(storage.getItem(key)??"[]");
      return Array.isArray(parsed)?parsed.filter(item=>item && typeof item.id==="string" && typeof item.title==="string"):[];
    } catch { return []; }
  }
  function write(tasks) { storage.setItem(key,JSON.stringify(tasks)); }
  return Object.freeze({
    list(){return read().map(task=>({...task}));},
    create({title}={}) {
      const clean=String(title??"").trim();
      if(!clean) throw new TypeError("Task title is required.");
      if(clean.length>160) throw new RangeError("Task title must be 160 characters or fewer.");
      const task={id:idFactory(),title:clean,completed:false,createdAt:now()};
      write([task,...read()]);
      return {...task};
    },
    setCompleted(id,completed) {
      const tasks=read();const index=tasks.findIndex(task=>task.id===id);
      if(index<0) return null;
      tasks[index]={...tasks[index],completed:Boolean(completed)};
      write(tasks);return {...tasks[index]};
    },
    remove(id) {
      const tasks=read();const next=tasks.filter(task=>task.id!==id);
      if(next.length===tasks.length) return false;
      write(next);return true;
    },
    exportJson(){return JSON.stringify(read(),null,2);}
  });
}
