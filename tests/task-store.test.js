import test from "node:test";
import assert from "node:assert/strict";
import {createTaskStore} from "../src/core/task-store.js";

function makeStorage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}
test("creates trimmed tasks with a pending state",()=>{
  const store=createTaskStore({storage:makeStorage(),idFactory:()=>"task-1",now:()=>"2026-11-14T12:00:00.000Z"});
  const task=store.create({title:"  Prepare launch  "});
  assert.deepEqual(task,{id:"task-1",title:"Prepare launch",completed:false,createdAt:"2026-11-14T12:00:00.000Z"});
});
test("rejects blank task titles",()=>{
  const store=createTaskStore({storage:makeStorage()});
  assert.throws(()=>store.create({title:"   "}),/title/i);
});
test("toggles task completion and preserves other tasks",()=>{
  const store=createTaskStore({storage:makeStorage(),idFactory:(()=>{let i=0;return()=>`task-${++i}`;})()});
  const first=store.create({title:"First"});store.create({title:"Second"});
  assert.equal(store.setCompleted(first.id,true).completed,true);
  assert.equal(store.list()[1].completed,false);
});
test("deletes only the requested task",()=>{
  const store=createTaskStore({storage:makeStorage(),idFactory:(()=>{let i=0;return()=>`task-${++i}`;})()});
  const first=store.create({title:"First"});store.create({title:"Second"});
  assert.equal(store.remove(first.id),true);
  assert.deepEqual(store.list().map(task=>task.title),["Second"]);
});
test("recovers from malformed stored JSON without crashing",()=>{
  const storage=makeStorage();storage.setItem("test-key","{broken");
  const store=createTaskStore({storage,key:"test-key"});
  assert.deepEqual(store.list(),[]);
});
