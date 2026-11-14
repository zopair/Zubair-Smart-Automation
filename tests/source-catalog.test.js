import test from "node:test";
import assert from "node:assert/strict";
import {listSourceEntries,searchSourceCatalog} from "../src/core/source-catalog.js";
test("ships only entries with canonical repositories and explicit audit metadata",()=>{const entries=listSourceEntries();assert.ok(entries.length>=5);for(const entry of entries){assert.match(entry.repository,/^[\w.-]+\/[\w.-]+$/);assert.match(entry.url,/^https:\/\/github\.com\//);assert.ok(entry.license);assert.match(entry.licenseSha,/^[a-f0-9]{40}$/);assert.ok(entry.auditStatus);assert.equal(entry.reviewedAt,"2026-11-14");}});
test("searches catalog by category, repository and technical fit",()=>{assert.ok(searchSourceCatalog({query:"WebGPU"}).some(entry=>entry.id==="web-llm"));assert.ok(searchSourceCatalog({category:"agent-builder"}).some(entry=>entry.id==="langflow"));});
test("filters license risk without silently hiding mixed-license projects",()=>{const mixed=searchSourceCatalog({licenseRisk:"medium"});assert.ok(mixed.some(entry=>entry.id==="activepieces"));assert.ok(searchSourceCatalog({query:"Activepieces"}).length>0);});
test("returns defensive copies",()=>{const entries=listSourceEntries();entries[0].name="tampered";assert.notEqual(listSourceEntries()[0].name,"tampered");});
