---
doc_type: codebase-map
focus: quality
last_mapped_at: 2026-04-27
---

# Testing

**Analysis Date:** 2026-04-27

## Current State

**There is no automated test suite in this repository.**

Verified by:

- `package.json` declares **no `test` / `test:*` script**. Scripts present are limited to `dev`, `build`, `preview`, and `tauri`.
- No `vitest.config.*`, `jest.config.*`, `cypress.config.*`, or `playwright.config.*` at repo root or under `src/`.
- No `*.test.{js,jsx}` or `*.spec.{js,jsx}` files anywhere under `src/` (the only matches under `node_modules/` are vendor configs).
- No `__tests__/`, `__mocks__/`, or `tests/` directory.
- No `e2e/`, `cypress/`, or `playwright/` directory.
- `CLAUDE.md` confirms: *"No hay scripts de tests ni de lint configurados."*

There is also **no lint configuration** (no `.eslintrc*`, no `eslint.config.*`, no `prettier` config). Code style is manual.

## Implications for Planning

When planning new work in this repo:

- **Do not assume tests will run on commit / PR.** No CI test gate exists in `.github/workflows/`.
- **Don't expect test fixtures.** No factories, no mocked API responses, no MSW handlers. Plans needing reference data must seed it themselves.
- **Manual UAT is the default verification path.** Verification steps in PLAN.md should describe explicit user-facing checks (clicks, expected UI states, network calls observed in DevTools).
- **A "broken" test cannot block the build because none exist.** Refactors that *would* break tests in a tested codebase pass silently here. Be more conservative about changing shared code (`src/utils/js/request.js`, `src/context/MainContext.jsx`, `src/storage/cookies-store.js`).

## Recommended Stack (When Tests Are Introduced)

This is the natural fit given the existing toolchain — no source changes required to adopt:

| Layer | Tool | Why |
|---|---|---|
| Unit / component | **Vitest** + `@testing-library/react` + `@testing-library/jest-dom` | Vitest is the Vite-native runner — picks up `vite.config.js` aliases for free, fastest install path. |
| DOM environment | `jsdom` (Vitest default) or `happy-dom` (faster) | Needed for component tests. |
| Network mocking | **MSW (Mock Service Worker)** | Intercepts Axios at the network layer. Same handlers can drive Storybook / dev. |
| Fake timers | Vitest built-in (`vi.useFakeTimers`) | Needed for the 15-second `setInterval` polling in `MainContext` and `NavBarCustom`. |
| E2E (optional) | **Playwright** | Cross-browser, supports both web build and Tauri desktop binary (via `tauri-driver`). |

### Minimum config to bootstrap

```jsonc
// package.json (additions)
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@testing-library/react": "^15.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jsdom": "^24.x",
    "msw": "^2.x"
  }
}
```

```js
// vitest.config.js (sibling to vite.config.js, can extend it)
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
}));
```

```js
// src/test/setup.js
import '@testing-library/jest-dom/vitest';
```

## Suggested File Layout

Co-locate tests next to the code they verify (matches the module-folder style already used here):

```
src/modules/alert/
├── views/
│   ├── index.jsx
│   └── index.test.jsx          # ← new
├── components/
│   ├── AlarmCard.jsx
│   └── AlarmCard.test.jsx      # ← new
└── utils/
    └── ...
```

For widely-shared modules (`request.js`, `MainContext.jsx`, `cookies-store.js`), prefer dedicated test files in the same folder rather than a top-level `tests/` tree.

## High-Value Targets to Cover First

When the user decides to add tests, prioritize in this order — these are the highest blast-radius modules and the ones that are hardest to verify manually:

1. **`src/utils/js/request.js`** — All three helpers (`request`, `requestPublic`, `requestFile`). Cover: token attachment, `withCredentials`, 401 behavior, error propagation. Mock Axios directly.
2. **`src/storage/cookies-store.js`** — Round-trip persistence on both Tauri and web branches. Mock `@tauri-apps/plugin-store`.
3. **`src/context/MainContext.jsx`** — Auth state transitions, role/permission derivation, the 15-second alert polling loop (use fake timers; verify cleanup on unmount).
4. **`src/hooks/useActiveRoutes.js`** — Permission-based route filtering. Pure function over a permissions array — easy unit test.
5. **`src/utils/routes/app.routes.js`** — Backend URL resolution table across `VITE_ENTORNO` × `VITE_APP_NAME`. Pure function — table-driven test.
6. **`src/context/TabContext.jsx`** — BroadcastChannel multi-tab guard. Mock `BroadcastChannel`; verify warning surfaces and primary-tab handoff.

## Mocking Patterns That Will Be Needed

| Boundary | What to mock | How |
|---|---|---|
| Axios | `request`, `requestPublic`, `requestFile` | `vi.mock('@/utils/js/request')` with stub fns; or MSW for higher-fidelity |
| Tauri runtime | `@tauri-apps/api`, `@tauri-apps/plugin-store` | `vi.mock('@tauri-apps/...')` to force the web branch in `cookies-store.js` |
| `localStorage` / cookies | — | jsdom provides; clear in `beforeEach` |
| `BroadcastChannel` | Browser API not in jsdom | Provide a global polyfill in `setup.js` |
| `setInterval` / polling | Fake timers | `vi.useFakeTimers()` + `vi.advanceTimersByTime(15000)` |
| MUI theme / context | — | Wrap renders in a `<ThemeProvider>` test helper |
| MainContext consumers | Provider | Build a `renderWithMainContext(ui, { user, role })` helper |

## Coverage Targets (When Adopted)

Reasonable thresholds for a codebase starting from zero — set as goals, not gates, until a baseline exists:

- Critical infra (`request.js`, `cookies-store.js`, `MainContext.jsx`): aim **80%+** lines.
- Reusable components in `src/components/`: aim **60%+** lines.
- Feature module views: opportunistic — cover bug-fix areas first; do not gate PRs on this.

## E2E (Future)

For end-to-end coverage of the desktop app:

- Use **Playwright** with [`tauri-driver`](https://v2.tauri.app/develop/tests/webdriver/) for the Tauri build.
- Reuse the same Playwright suite against the web build (`npm run preview`) — most flows are identical.
- Critical golden paths: login → tenant select → home dashboard; create alarm → trigger → see in alert list; draw a diagram → save → reopen.

---

*Testing audit: 2026-04-27*
