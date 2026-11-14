import test from "node:test";
import assert from "node:assert/strict";
import {buildShortsPlannerHtml} from "../src/tools/shorts-planner-export.js";
test("exports an offline Arabic short-video planner",()=>{const html=buildShortsPlannerHtml();assert.match(html,/<html lang="ar" dir="rtl">/);assert.match(html,/id="planner"/);assert.match(html,/connect-src 'none'/);});
test("keeps user-entered text in text nodes",()=>{const html=buildShortsPlannerHtml();assert.match(html,/textContent/);assert.doesNotMatch(html,/innerHTML\s*=/);});
test("uses a valid id lookup helper in the standalone planner",()=>{const html=buildShortsPlannerHtml();assert.ok(html.includes("getElementById(id.replace"));});
