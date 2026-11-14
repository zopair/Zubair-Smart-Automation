import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {buildSourceCatalogHtml} from "../src/tools/source-catalog-export.js";
test("exports a self-contained source catalog with audit cautions",()=>{const html=buildSourceCatalogHtml();assert.match(html,/<html lang="ar" dir="rtl">/);assert.match(html,/راجع الترخيص الكامل/);assert.match(html,/connect-src 'none'/);});
test("does not inject catalog data as HTML markup",()=>{const html=buildSourceCatalogHtml();assert.match(html,/textContent/);assert.doesNotMatch(html,/innerHTML\s*=/);});
test("exports direct license links for every catalog entry",()=>{const html=buildSourceCatalogHtml();assert.match(html,/licenseLink\.href=e\.licenseUrl/);});
test("declares every generated DOM node before using it",()=>{const html=buildSourceCatalogHtml();assert.match(html,/evidence=document\.createElement\("small"\)/);});

test("executes catalog rendering and filters against a minimal DOM",()=>{
 const html=buildSourceCatalogHtml(),source=html.match(/<script>([\\s\\S]*?)<\\/script>/i)?.[1];
 assert.ok(source);
 const listeners=new Map();
 class Element{constructor(){this.children=[];this.value="all";this.textContent="";}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=[...items];}addEventListener(type,handler){listeners.set(this,type+":"+handler);this.handlers??={};this.handlers[type]=handler;}}
 const elements=new Map([["#query",new Element()],["#category",new Element()],["#risk",new Element()],["#list",new Element()],["#count",new Element()]]);
 const document={querySelector:selector=>elements.get(selector),createElement:()=>new Element()};
 vm.runInNewContext(source,{document});
 assert.equal(elements.get("#list").children.length,5);
 elements.get("#query").value="WebGPU";elements.get("#query").handlers.input();
 assert.equal(elements.get("#list").children.length,1);
 elements.get("#query").value="";elements.get("#risk").value="high";elements.get("#risk").handlers.input();
 assert.equal(elements.get("#list").children.length,2);
});
