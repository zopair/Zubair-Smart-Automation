import test from "node:test";
import assert from "node:assert/strict";
import {resolveStaticPath} from "../scripts/static-path.js";

test("resolves a path inside the static root",()=>{
  assert.equal(resolveStaticPath("/app/dist","/src/main.js"),"/app/dist/src/main.js");
});
test("rejects traversal outside the static root",()=>{
  assert.equal(resolveStaticPath("/app/dist","/../secret.txt"),null);
});
test("rejects encoded traversal",()=>{
  assert.equal(resolveStaticPath("/app/dist","/%2e%2e/secret.txt"),null);
});
test("rejects malformed encoded paths",()=>{
  assert.equal(resolveStaticPath("/app/dist","/%E0%A4%A"),null);
});
