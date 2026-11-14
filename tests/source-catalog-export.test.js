import test from "node:test";
import assert from "node:assert/strict";
import {buildSourceCatalogHtml} from "../src/tools/source-catalog-export.js";
test("exports a self-contained source catalog with audit cautions",()=>{const html=buildSourceCatalogHtml();assert.match(html,/<html lang="ar" dir="rtl">/);assert.match(html,/راجع الترخيص الكامل/);assert.match(html,/connect-src 'none'/);});
test("does not inject catalog data as HTML markup",()=>{const html=buildSourceCatalogHtml();assert.match(html,/textContent/);assert.doesNotMatch(html,/innerHTML\s*=/);});
test("exports direct license links for every catalog entry",()=>{const html=buildSourceCatalogHtml();assert.match(html,/licenseLink\.href=e\.licenseUrl/);});
test("declares every generated DOM node before using it",()=>{const html=buildSourceCatalogHtml();assert.match(html,/evidence=document\.createElement\("small"\)/);});
