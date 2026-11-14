import test from "node:test";
import assert from "node:assert/strict";
import {analyzeRequest} from "../src/core/request-analyzer.js";
test("returns an actionable result for empty input",()=>{assert.equal(analyzeRequest("  ").intent,"unknown");});
test("detects task management requests",()=>{assert.equal(analyzeRequest("أريد تنظيم مهام فريقي").intent,"task-manager");});
test("detects mini store requests",()=>{assert.equal(analyzeRequest("أريد إنشاء متجر لبيع المنتجات").intent,"mini-store");});
test("detects short-form video requests",()=>{assert.equal(analyzeRequest("أريد أفكار ريلز وفيديوهات").intent,"shorts-content");});
test("does not guess when no template matches",()=>{assert.equal(analyzeRequest("أحتاج نظاماً لإدارة أسطول المركبات").intent,"unknown");});
test("prioritizes explicit agent workflow intent over incidental task keywords",()=>{assert.equal(analyzeRequest("أريد وكيل ينظم النص ويضيف مهمة بعد الموافقة").intent,"agent-workflow");});
