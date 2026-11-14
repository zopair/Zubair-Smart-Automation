# Initial upstream repository audit

**Checked:** 2026-11-14  
**Purpose:** identify useful upstream candidates and prevent accidental adoption of archived, server-only, or non-open-source/fair-code software.

This is a point-in-time GitHub repository metadata check. A GitHub API `license.spdx_id` of `NOASSERTION` is not proof that a project has no license; it means the API did not return a recognized SPDX identifier. The actual LICENSE/NOTICE files and license scope must be inspected before copying or redistributing code.

## Browser-first candidates

| Canonical repository | GitHub license metadata | Last push observed | Proposed role | Decision |
|---|---|---:|---|---|
| [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) | Apache-2.0 | 2026-11-14 | In-browser LLM inference using WebGPU | Priority evaluation; browser/device compatibility and model download size required |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | Apache-2.0 | 2026-11-14 | Browser ML inference, embeddings and supported pipelines | Priority evaluation; select individual models/tasks and measure bundle footprint |
| [oramasearch/orama](https://github.com/oramasearch/orama) | NOASSERTION | 2026-10-18 | Lightweight full-text/vector/hybrid search | Evaluate license text and browser bundle before adoption |
| [dexie/Dexie.js](https://github.com/dexie/Dexie.js) | Apache-2.0 | 2026-11-09 | IndexedDB data layer | Evaluate only if native IndexedDB becomes too verbose |
| [mholt/PapaParse](https://github.com/mholt/PapaParse) | MIT | 2026-11-12 | CSV import/export parsing | Candidate for import feature |
| [chartjs/Chart.js](https://github.com/chartjs/Chart.js) | MIT | 2026-11-09 | Dashboard charts | Defer until chart requirements exist |
| [SortableJS/Sortable](https://github.com/SortableJS/Sortable) | MIT | 2026-03-24 | Drag-and-drop sorting | Defer until sortable lists are implemented |

## Local runtimes and self-hosted platforms

| Canonical repository | GitHub license metadata | Last push observed | Proposed role | Decision |
|---|---|---:|---|---|
| [ollama/ollama](https://github.com/ollama/ollama) | MIT | 2026-11-14 | Optional local model runtime | Integration adapter only; requires local installation/runtime |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | NOASSERTION | 2026-11-14 | External workflow automation | Do not label as OSI open source or embed in client export; inspect Sustainable Use/fair-code terms |
| [meilisearch/meilisearch](https://github.com/meilisearch/meilisearch) | NOASSERTION | 2026-11-12 | Hosted/self-hosted search service | Server component; license and deployment terms need review |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Apache-2.0 | 2026-11-14 | Browser E2E and generated-app QA | Priority for CI browser testing once a browser runner is provisioned |

## Agent and orchestration candidates

| Canonical repository | GitHub license metadata | Last push observed | Proposed role | Decision |
|---|---|---:|---|---|
| [microsoft/autogen](https://github.com/microsoft/autogen) | CC-BY-4.0 | 2026-11-12 | Multi-agent orchestration | Review license suitability carefully; do not assume standard permissive software license |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | MIT | 2026-11-13 | Role-based agent orchestration | Backend/worker option, not client bundle |
| [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) | NOASSERTION | 2026-11-14 | Autonomous agent platform | Review actual license, architecture and threat model before use |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | MIT | 2026-11-14 | Software engineering agent reference | Separate engineering-agent product; not required in the user-facing MVP |

## Media and social publishing

| Canonical repository | GitHub license metadata | Last push observed | Proposed role | Decision |
|---|---|---:|---|---|
| [openai/whisper](https://github.com/openai/whisper) | MIT | 2026-08-31 | Speech transcription | Heavy model/runtime; evaluate as optional local/server pipeline |
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | NOASSERTION | 2026-11-14 | Audio/video processing | Build configuration can affect LGPL/GPL obligations; review exact binary build |
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | AGPL-3.0 | 2026-11-14 | Social publishing/scheduling reference | Strong copyleft and service requirements; integrate as external service only after legal review |

## Corrections and warnings against the supplied candidate list

- WebLLM's canonical repository is `mlc-ai/web-llm`, not `webllm/web-llm`.
- The current Postiz repository is `gitroomhq/postiz-app`; the checked metadata reports AGPL-3.0.
- The current Orama repository is `oramasearch/orama`; inspect its license file because GitHub metadata returned NOASSERTION.
- The Papa Parse repository is `mholt/PapaParse`; the supplied `PapaParse/PapaParse` path is not the canonical project.
- OpenDevin has evolved/renamed to OpenHands; use [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) as the current project reference.
- The checked Flowise repository `FlowiseAI/Flowise` was marked archived by GitHub on the audit date. Do not adopt it as a maintained dependency without confirming a successor.
- n8n is a powerful option, but its GitHub metadata does not identify an OSI license. It must not be advertised as a freely reusable permissive open-source component without reviewing its current license terms.

## Adoption gates

Before a candidate becomes an actual dependency:
1. Read the current LICENSE, NOTICE, and relevant model/data licenses.
2. Confirm whether the intended use is internal, redistribution, SaaS, or embedding in exported HTML.
3. Check release cadence, advisories, open issues and runtime requirements.
4. Pin an exact version and generate an SBOM.
5. Run license, vulnerability, bundle-size and browser-compatibility checks.
6. Record why the dependency is better than native browser APIs or a smaller alternative.

**Current adoption status:** no third-party runtime dependency has been added to the MVP. This keeps the base build small, auditable, and free of supply-chain surprises.
