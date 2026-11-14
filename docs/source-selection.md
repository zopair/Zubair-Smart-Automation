# Open-source source selection

## Selection rules
No upstream project is adopted merely because it appears in a candidate list. Before integration, record: canonical repository, current maintenance signal, license and its exact scope, dependency footprint, browser/server runtime, security posture, build compatibility, and the feature it replaces.

## Initial candidates by role

| Role | Candidate | Initial decision | Reason |
|---|---|---|---|
| Browser LLM runtime | WebLLM | Evaluate first | Browser/WebGPU-oriented inference; hardware and model-download constraints must be disclosed |
| Browser model utilities | Transformers.js | Evaluate first | Potential browser inference and embedding workflows; model/task compatibility must be tested |
| Local model runtime | Ollama | Optional adapter | Local runtime, not a browser-only dependency |
| Agent orchestration | LangChain.js | Defer | Use only for workflows where its abstraction provides measurable value |
| Agent teams | AutoGen / CrewAI | Defer | Backend/runtime-oriented; not default for static exports |
| Workflow automation | n8n / Node-RED | Optional integration | Self-hosted services, not embedded client-side modules |
| Video processing | FFmpeg / MoviePy | Evaluate by execution target | Heavy processing/runtime requirements; browser builds require a separate feasibility review |
| Browser media | WebCodecs / MediaRecorder APIs | Prefer native APIs where sufficient | Avoid shipping a large media stack without a concrete need |
| Local persistence | IndexedDB / Dexie | Evaluate | Prefer native IndexedDB until query complexity justifies an abstraction |
| CSV | Papa Parse | Evaluate | Focused parsing dependency when native parsing is insufficient |
| Charts | Chart.js | Evaluate | Add only when dashboard visualizations ship |
| Drag and drop | SortableJS | Evaluate | Add only when sortable UI is required |
| Browser testing | Playwright | Adopt in CI when browser runner is available | E2E coverage for generated tools and install flows |
| API documentation | Swagger UI | Optional | Only for products exposing APIs |

## Non-negotiable checks
- Verify license from the repository's current LICENSE file and upstream owner.
- Check last release/commit and open security advisories before pinning versions.
- Do not copy source code into generated artifacts without license and notice compliance.
- Do not bundle self-hosted server software into a claim of zero-server operation.
- Never expose credentials, API keys, or user tokens to generated client-side code.

## Candidate inventory
The 150-repository list supplied in the project conversation is an input backlog, not a verified compatibility or license statement. Each candidate must pass the checks above before it becomes an approved dependency.
