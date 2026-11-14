import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {stat} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";

const port=Number(process.env.SMOKE_PORT??4174);
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,["scripts/preview.mjs"],{cwd:process.cwd(),env:{...process.env,PORT:String(port)},stdio:["ignore","pipe","pipe"]});
let diagnostics="";
child.stdout.on("data",chunk=>diagnostics+=chunk);
child.stderr.on("data",chunk=>diagnostics+=chunk);
try{
  let response;
  for(let attempt=0;attempt<40;attempt++){
    if(child.exitCode!==null)throw new Error(`Preview server exited early: ${diagnostics}`);
    try{response=await fetch(base);break;}catch{await delay(100);}
  }
  await stat("dist/.nojekyll");\n  assert.ok(response,"Preview server did not become ready.");
  assert.equal(response.status,200);
  assert.match(response.headers.get("content-type")??"",/text\/html/);
  const html=await response.text();
  assert.match(html,/Zubair Smart Automation/);
  for(const path of ["/src/main.js","/src/styles.css"]){const asset=await fetch(base+path);assert.equal(asset.status,200,`Expected ${path} to load`);assert.ok((await asset.text()).length>0);}
  const health=await fetch(base+"/api/health");assert.equal(health.status,200);assert.equal((await health.json()).available,false);
  const head=await fetch(base,{method:"HEAD"});assert.equal(head.status,200);assert.equal(await head.text(),"");
  const post=await fetch(base,{method:"POST"});assert.equal(post.status,405);
  const missing=await fetch(base+"/not-found.js");assert.equal(missing.status,404);
  console.log("Preview smoke passed: HTML, JS, CSS, HEAD, method guard and 404.");
}finally{
  child.kill("SIGTERM");
}
