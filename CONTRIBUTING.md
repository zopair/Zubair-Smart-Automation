# Contributing

## Change policy
- Keep the browser-first core dependency-light.
- Prefer native browser APIs until a concrete requirement justifies a library.
- Never place API keys, tokens, or private credentials in browser code.
- Treat generated/user-provided text as data, never executable source.
- Keep each change focused and explain its user-visible behavior.

## Required checks
Run before opening a pull request:
```bash
npm run check
npm test
npm run build
```

## Tests
Add tests for behavior changes. Prefer deterministic unit tests and reproduce defects before fixing them. Browser-level tests are required for critical flows once the browser test harness is available.

## Upstream dependencies
Before adding an upstream project:
1. Verify its canonical repository and current release state.
2. Read LICENSE and NOTICE files, including model/data licenses.
3. Record the runtime target (browser, local process, or server).
4. Pin versions and review security advisories.
5. Measure bundle size and test browser compatibility.
6. Explain why native platform capabilities are insufficient.

## Pull requests
Include scope, tests executed, known limitations, security implications, and rollback notes.
