import test from "node:test";
import assert from "node:assert/strict";
import {buildMiniStoreHtml} from "../src/tools/mini-store-export.js";
test("exports a self-contained Arabic RTL mini-store",()=>{const html=buildMiniStoreHtml();assert.match(html,/<html lang="ar" dir="rtl">/);assert.match(html,/<title>متجري المصغر<\/title>/);assert.match(html,/id="checkout"/);});
test("keeps standalone store offline except explicit WhatsApp navigation",()=>{const html=buildMiniStoreHtml();assert.match(html,/connect-src 'none'/);assert.doesNotMatch(html,/<script[^>]+src=/i);assert.doesNotMatch(html,/<link[^>]+href=/i);});
test("renders user product names through textContent",()=>{const html=buildMiniStoreHtml();assert.match(html,/name\.textContent=p\.name/);assert.doesNotMatch(html,/innerHTML\s*=/);});
