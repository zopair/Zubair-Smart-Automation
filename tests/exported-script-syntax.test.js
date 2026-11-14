import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {buildTaskManagerHtml} from "../src/tools/task-manager-export.js";
import {buildMiniStoreHtml} from "../src/tools/mini-store-export.js";
import {buildShortsPlannerHtml} from "../src/tools/shorts-planner-export.js";
for(const [name,build] of [["task manager",buildTaskManagerHtml],["mini store",buildMiniStoreHtml],["shorts planner",buildShortsPlannerHtml]]){
  test(`embedded ${name} JavaScript parses before export`,()=>{
    const html=build(),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
    assert.ok(scripts.length>0,"standalone export must include an executable script");
    for(const source of scripts)new vm.Script(source);
  });
}
