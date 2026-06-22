---
doc_type: codebase-map
focus: arch
last_mapped_at: 2026-04-27
---

# Directory Structure

**Analysis Date:** 2026-04-27

## Top-Level Layout

```
mas-agua-front/
├── src/                  # React application source
├── src-tauri/            # Tauri v2 desktop wrapper (Rust)
├── public/               # Static assets served as-is by Vite
├── dist/                 # Vite production output (gitignored)
├── node_modules/         # npm deps (gitignored)
├── .github/workflows/    # CI/CD (cd_master, cd_dev, cd_desktop)
├── package.json          # Frontend deps + scripts
├── vite.config.js        # Vite config (dev port 1420)
├── tailwind.config.js    # Tailwind palette + dark mode strategy
├── postcss.config.js     # PostCSS pipeline
├── Dockerfile            # Multi-stage Nginx image
├── nginx.conf            # SPA-routing Nginx config
└── CLAUDE.md             # Project guide for Claude Code
```

## `src/` — React Application

```
src/
├── main.jsx                   # React DOM entry; mounts <App /> into #root
├── App.jsx                    # Top-level providers + theme + Routes outlet
├── App.css, styles.css        # Global CSS
├── firebase.js                # FCM client init (config hard-coded)
├── assets/                    # Images / SVGs imported by JS
├── class/                     # Plain JS classes (domain helpers)
│
├── context/                   # Global state (React Context only)
│   ├── MainContext.jsx        # Auth, darkMode, roles, tabs, active tenant, alert polling (15s)
│   └── TabContext.jsx         # BroadcastChannel-based multi-tab guard
│
├── hooks/                     # Cross-module hooks
│   ├── useActiveRoutes.js     # Filters routes by user permissions at runtime
│   └── useUpdater.js          # Tauri auto-update check
│
├── routes/                    # Route tables, split by auth state
│   ├── loguin.Routes.jsx      # Public: /login, /ListClients, /LoginCooptech/:token
│   ├── user.Routes.jsx        # Protected: 40+ feature routes
│   ├── client.Routes.jsx      # Per-tenant route overrides
│   └── external.Routes.jsx    # Restricted route set for profile-id 5
│
├── storage/                   # Persistence abstraction (Tauri ↔ web)
│   ├── cookies-store.js       # Public API used by request.js / contexts
│   └── storage.js             # Internal switch (Tauri plugin-store vs js-cookie)
│
├── utils/
│   ├── js/
│   │   ├── request.js                # Axios helpers: request, requestPublic, requestFile
│   │   ├── formatDate.js
│   │   ├── randomNumberGenerator.js
│   │   ├── transformTypes.js
│   │   └── updateSwal.js             # SweetAlert2 helpers
│   └── routes/
│       └── app.routes.js             # Backend URL resolution from VITE_ENTORNO × VITE_APP_NAME
│
├── components/                # Cross-module reusable UI
│   ├── ButtonCustom/
│   ├── CardCustom/
│   ├── ChipCustom/
│   ├── DataGenerator/
│   ├── FiltersBar.jsx
│   ├── Graphs/
│   ├── InputColor/
│   ├── InputFile/
│   ├── ListIcon/
│   ├── Loader/
│   ├── ModalShell.jsx
│   ├── PageHeader.jsx
│   ├── SelectorVars/
│   ├── SwalLoader/
│   ├── TableActions.jsx
│   └── TableCustom/
│
└── modules/                   # Feature folders (self-contained)
```

## `src/modules/` — Feature Modules

Each module owns its `views/`, `components/`, sometimes `hooks/`, `utils/`, `factories/`. No shared barrel files; imports are explicit.

| Module | Purpose | Notable files |
|---|---|---|
| `core/` | Authenticated shell (NavBar + Footer + auth gate) | `views/index.jsx` (`MainContent`) |
| `LoginApp/` | Login form + tenant selection | — |
| `home/` | Landing dashboard | `views/index.jsx` |
| `dashBoard/` | Configurable widget dashboard (`react-grid-layout`) | `views/ChartsDashboard.jsx`, `factories/` |
| `Boards/` | Board container view | `views/index.jsx` |
| `Charts/` | Chart builder (multiple chart-type configurators) | `views/ChartsTable.jsx`, `views/Config*.jsx` |
| `DrawDiagram/` | Konva-based diagram editor | `views/DrawDiagram.jsx`, `views/ViewDiagram.jsx`, `views/ListDrawDiagram.jsx`, `components/DiagramCanvas/` |
| `Map/` | MapLibre GL maps | — |
| `alert/` | Alert list + cards | `views/index.jsx`, `components/AlarmCard.jsx`, `components/AlarmToolbar.jsx` |
| `Notification/` | In-app notifications + FCM surface | — |
| `NavBarCustom/` | Top nav, drawer, notification polling | `views/index.jsx`, `components/DrawerCustom.jsx`, `components/SubMenuCustom.jsx` |
| `PumpsTable/` | Pump monitoring table | `views/index.jsx` |
| `ConfigMenu/` | Admin: menu structure | — |
| `configSecurity/` | Admin: roles & permissions | `views/index.jsx` |
| `ConfigVars/` | Admin: variables | `views/Vars.jsx` |
| `ConfigAlarms/` | Admin: alarm rules | `views/index.jsx` |
| `ConfigNotifications/` | Admin: device/FCM registration | `views/index.jsx` |
| `ExternalUsers/` | External user management | `views/index.jsx` |
| `profile/` | User profile | `views/index.jsx` |
| `ProfilePLC/` | PLC profile | `views/ProfilePLC.jsx` |
| `tabs/` | Dynamic-tab manager | `views/index.jsx` |
| `Errors/` | Error pages (404, etc.) | — |

## `src-tauri/` — Desktop Wrapper

```
src-tauri/
├── Cargo.toml         # Rust deps: tauri 2.4, plugin-store 2.4.1, plugin-updater 2.4.1, plugin-process 2
├── Cargo.lock
├── build.rs
├── tauri.conf.json    # Bundle targets, updater endpoint, app metadata
├── src/main.rs        # Rust entry — initializes plugins, builds Tauri app
├── icons/, icon.png   # Platform icons
├── keys/              # Updater signing keys (private key NOT in repo)
├── gen/               # Generated platform projects
└── target/            # Rust build artifacts (gitignored)
```

> Note: there is **no `src-tauri/capabilities/` directory**. Capabilities are inlined in `tauri.conf.json` (Tauri v2 supports both layouts).

## Naming Conventions

| Scope | Convention | Example |
|---|---|---|
| React component file | PascalCase, `.jsx` | `PageHeader.jsx`, `AlarmCard.jsx` |
| Module folder | PascalCase or camelCase mix (legacy) | `DrawDiagram/`, `dashBoard/`, `configSecurity/` |
| Sub-folders within a module | lowercase: `views/`, `components/`, `hooks/`, `utils/`, `factories/` | — |
| View entry file | `index.jsx` for single-view modules; named `.jsx` per view for multi-view modules | `Charts/views/ConfigPie.jsx` |
| Plain utility | camelCase, `.js` | `formatDate.js`, `request.js` |
| Hook | `use*.js` | `useActiveRoutes.js`, `useUpdater.js` |
| Routes file | `*.Routes.jsx` | `user.Routes.jsx` |
| Context | `*Context.jsx` | `MainContext.jsx` |

> ⚠ Module-folder casing is inconsistent (`dashBoard`, `configSecurity` are camelCase outliers among PascalCase peers). New modules should use **PascalCase** to align with the majority.

## Where to Add New Code

| You're adding... | Put it in... |
|---|---|
| A new feature page/flow | `src/modules/<FeatureName>/` with `views/`, `components/`, `utils/` as needed |
| A reusable widget used by 2+ modules | `src/components/` |
| A new authenticated route | Register in `src/routes/user.Routes.jsx` (and `external.Routes.jsx` if external users see it) |
| A new public route | `src/routes/loguin.Routes.jsx` |
| A backend call helper | `src/utils/js/` or co-locate in the module's `utils/` |
| A new env-driven endpoint | `src/utils/routes/app.routes.js` |
| A persisted client-side value | Use `src/storage/cookies-store.js` (do not call `localStorage` directly) |
| Global state | Extend `MainContext.jsx` only when truly cross-cutting; otherwise keep state local |
| A new icon / image | `src/assets/` and import directly |

## Special / Generated Directories

- `dist/` — Vite production build output. Regenerated on every `npm run build`.
- `node_modules/` — npm install artifact. Never edit.
- `src-tauri/target/` — Rust/Tauri build artifact. Gitignored.
- `src-tauri/gen/` — Generated platform-specific scaffolding. Touch only via Tauri CLI.

## Notable Patterns

- **No barrel `index.js` re-exports** in modules — imports point at concrete files.
- **No global `services/`, `api/`, or `lib/` layer** — request helpers live in `src/utils/js/request.js`; per-feature data fetching is inlined in views.
- **No types directory** — JSX-only project; type packages installed but unused.
- **Three styling systems coexist:** MUI `sx`, Joy UI, and Tailwind utilities. Tailwind is more common in newer files (e.g. `PageHeader.jsx`, `FiltersBar.jsx`); older modules lean MUI.
