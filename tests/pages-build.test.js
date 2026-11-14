import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const index=await readFile(new URL("../index.html",import.meta.url),"utf8");\nconst main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");\nconst shorts=await readFile(new URL("../src/tools/shorts-planner.js",import.meta.url),"utf8");
test("uses relative asset and home links for project-subpath hosting",()=>{assert.match(index,/href="\.\/src\/styles\.css"/);assert.match(index,/src="\.\/src\/main\.js"/);assert.match(index,/class="brand" href="\.\/"/);assert.doesNotMatch(index,/href="\/src\//);});
\ntest("uses same-origin relative paths for optional AI API calls",()=>{assert.match(main,/fetch\("\.\/api\/health"\)/);assert.match(main,/fetch\("\.\/api\/generate"/);assert.match(shorts,/fetch\("\.\/api\/health"\)/);assert.match(shorts,/fetch\("\.\/api\/generate"/);});\n