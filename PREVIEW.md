# Zubair Smart Automation — Preview Readiness

## What to preview
An Arabic RTL, browser-based MVP for local task management, a mini-store, short-video planning, source discovery, and approval-gated workflows. It is a local product preview, not a hosted multi-user service.

## Fast local preview
Requirements: Node.js 20+.

```bash
npm test
npm run check
npm run build
npm run smoke
npm run preview
```

Open http://127.0.0.1:4173.

## Suggested 6-minute walkthrough
1. Demonstrate the Arabic RTL home screen and request analyzer.
2. Create and complete a local task.
3. Add a product, adjust stock, and create a sample order in the mini-store.
4. Prepare a short-video plan and export the standalone HTML.
5. Search the source catalog and inspect its licensing notes.
6. Create a workflow, review its steps, approve it explicitly, and inspect the local audit trail.

Use fictional products, contacts, and order details only.

## Preview acceptance
- [ ] Tests, syntax checks, build, and smoke checks pass.
- [ ] RTL layout is usable on desktop and mobile widths.
- [ ] Each demo tool works after a page refresh where persistence is expected.
- [ ] Exports open independently without remote assets.
- [ ] Workflow actions remain within the allowlist and require explicit approval.
- [ ] AI proxy remains optional; no provider key is shipped to the browser.

## Known limits to disclose
This is an MVP; each feature still needs browser-level validation. External agent connectors are deferred. AI text generation requires a separately configured server-side proxy. The repository has no project license yet: public visibility does not grant reuse or redistribution rights. Do not market it as a production multi-tenant automation platform.

## Reviewer evidence
Attach the CI run, smoke output, screenshots at mobile and desktop widths, and one exported HTML artifact. Do not include API keys or real customer data.
