import test from "node:test";
import assert from "node:assert/strict";
import {buildTaskManagerHtml} from "../src/tools/task-manager-export.js";

test("creates a standalone Arabic HTML document",()=>{
  const html=buildTaskManagerHtml();
  assert.match(html,/<!doctype html>/i);
  assert.match(html,/<html lang="ar" dir="rtl">/);
  assert.match(html,/<title>مدير المهام الذكي<\/title>/);
});
test("keeps the exported tool independent of external assets and services",()=>{
  const html=buildTaskManagerHtml();
  assert.doesNotMatch(html,/<script[^>]+src=/i);
  assert.doesNotMatch(html,/<link[^>]+href=/i);
  assert.doesNotMatch(html,/https?:\/\//i);
  assert.match(html,/connect-src 'none'/);
});
test("uses text nodes for user-entered task titles",()=>{
  const html=buildTaskManagerHtml();
  assert.match(html,/textContent/);
  assert.doesNotMatch(html,/innerHTML\s*=\s*task\.title/);
});
