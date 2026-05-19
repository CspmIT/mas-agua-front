<!-- refreshed: 2026-04-27 -->
# Architecture

**Analysis Date:** 2026-04-27

## System Overview

Mas Agua is a multi-tenant water plant management system deployed as both a web application (Vite + Docker) and desktop application (Tauri v2). The same React codebase serves both platforms. State management uses two React Contexts (MainContext and TabContext) instead of Redux/Zustand. Routing is auth-aware with public, protected, and external-user subsets.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Tauri App                       │
│          HTML Entry Point: `index.html` → `main.jsx`         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              React App Root (`src/App.jsx`)                  │
│   - Route filtering by auth state & user profile            │
│   - MUI ThemeProvider wrapping (dark mode toggle)           │
│   - BrowserRouter for SPA navigation                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│             Context Providers (`src/main.jsx`)               │
│   - TabProvider: Multi-tab detection via BroadcastChannel   │
│   - MainProvider: Auth, darkMode, roles, active tenant      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────┬──────────────────────┬───────────────┐
│  Public Routes       │  Protected Routes    │  External     │
│  `loguin.Routes`     │  `user.Routes`       │  Routes       │
│  - /login            │  - 40+ admin/user    │  (Profile 5   │
│  - /ListClients      │    dashboards        │   only)       │
│  - /LoginCooptech    │  - /config/*         │               │
│                      │  - /chart, /map      │               │
│                      │  - /diagram, /alert  │               │
└──────────────────────┴──────────────────────┴───────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  MainContent Wrapper (`src/modules/core/views/index.jsx`)   │
│  - Renders NavBar + Outlet (child routes) + Footer          │
│  - Auth validation on location change                       │
│  - Conditional loader display                              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              Module Views (Feature Containers)                │
│  Each under `src/modules/[ModuleName]/views/`                │
│                                                               │
│  ├─ LoginApp (auth)          ├─ Charts (graph builder)        │
│  ├─ home (dashboard)         ├─ DrawDiagram (Konva editor)   │
│  ├─ dashBoard (responsive)   ├─ Map (MapLibre GL)            │
│  ├─ ConfigMenu (permissions) ├─ alert (notifications)        │
│  └─ [20+ others]             └─ PumpsTable (monitoring)      │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         Module Components & Local Logic                       │
│  - Charts: LiquidFill, CirclePercent, BarChart, etc.         │
│  - DrawDiagram: DiagramCanvas, Sidebar, TextEditor, etc.     │
│  - Map: MapBase, ControlPanel, Pin layers                    │
│  - Forms: ConfigSimple, HeaderForms, VarsProvider            │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│    Shared UI Components (`src/components/`)                   │
│  - ButtonCustom, CardCustom, TableCustom                     │
│  - DataGenerator (dynamic form fields)                       │
│  - Loader, SwalLoader, Graphs                                │
│  - InputColor, InputFile, SelectorVars                       │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         Request Layer & API Communication                     │
│  - `src/utils/js/request.js`: Authenticated/public/file reqs  │
│  - `src/utils/routes/app.routes.js`: Endpoint resolution     │
│  - Axios with JWT Bearer auth (from storage or Tauri Store)  │
│  - VITE_ENTORNO determines backend URL (local/dev/prod)      │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         Storage Abstraction (`src/storage/`)                  │
│  - `cookies-store.js`: Platform-aware (Tauri Store vs Cookies) │
│  - `storage.js`: localStorage wrapper (JSON serialization)    │
│  - Unified interface: `saveData()`, `getData()`, `removeData()` │
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         External Services & APIs                              │
│  - Cooptech (auth, SSO)                                       │
│  - MinIO (file storage at /minio endpoint)                    │
│  - Backend API (Mas Agua: /api port 4000/dev/prod)           │
│  - Socket.io (real-time notifications - commented out)       │
│  - Firebase (messaging - referenced in NavBar)                │
└──────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| MainContext | Global auth state, darkMode, active tenant, unread alert count, permission list | `src/context/MainContext.jsx` |
| TabContext | Multi-tab detection via BroadcastChannel, blocking UI when app opens in another tab | `src/context/TabContext.jsx` |
| App | Route filtering by auth/profile, theme creation, Tauri update checks | `src/App.jsx` |
| MainContent | Auth validation wrapper, NavBar + Outlet + Footer layout | `src/modules/core/views/index.jsx` |
| NavBarCustom | Top navigation, menu sidebar, notification polling, Firebase messaging integration | `src/modules/NavBarCustom/views/index.jsx` |
| Home | Primary dashboard: responsive grid layout, chart rendering, edit mode, drag-drop reordering | `src/modules/home/views/index.jsx` |
| LoginApp | Credential input, token persistence, tenant selection, password recovery | `src/modules/LoginApp/view/index.jsx` |
| DrawDiagram | Konva-based diagram editor: shapes, text, lines, images, tooltips, save/load | `src/modules/DrawDiagram/views/DrawDiagram.jsx` |
| Charts | Chart configuration (line, pie, bar, boolean, gauge, liquid fill) and rendering | `src/modules/Charts/views/ConfigGraphic.jsx` |
| Map | MapLibre GL map display, layer control, GeoJSON features, pin placement | `src/modules/Map/Views/MapView.jsx` |
| Alert | Alert/alarm listing, filtering, acknowledgment, real-time updates | `src/modules/alert/views/index.jsx` |
| Storage (cookies-store) | Platform detection and conditional persistence (Tauri Store vs js-cookie) | `src/storage/cookies-store.js` |
| Request helpers | Axios wrappers for authenticated, public, and multipart file requests | `src/utils/js/request.js` |
| useActiveRoutes | Memoized route filtering by external user status and client-specific overrides | `src/hooks/useActiveRoutes.js` |
| useUpdater | Tauri auto-update check, download, progress UI, install & relaunch | `src/hooks/useUpdater.js` |

## Pattern Overview

**Overall:** Multi-tenant React SPA with platform abstraction (web + Tauri desktop) using React Router v6, Context API state management, and a modular feature-based folder structure.

**Key Characteristics:**
- Stateless components + Context for global state (no Redux)
- Module-first organization: each feature folder self-contains views, components, utils
- Storage abstraction at the platform level (Tauri Store vs localStorage)
- Request helpers handle auth token injection from either storage backend
- Client-specific route overrides allow per-tenant UI customization
- Two-Context pattern: MainContext (business data) + TabContext (UI blocking)

## Layers

**Presentation Layer:**
- Purpose: React components, forms, layouts, rendering
- Location: `src/modules/[Feature]/views/`, `src/modules/[Feature]/components/`, `src/components/`
- Contains: JSX, styling (MUI + Tailwind), event handlers
- Depends on: Context (for state), request helpers, storage
- Used by: User interaction, router navigation

**State Management Layer:**
- Purpose: Global auth, UI mode, active tenant, permissions, unread count
- Location: `src/context/MainContext.jsx`, `src/context/TabContext.jsx`
- Contains: React Context Providers, useState, useEffect polling
- Depends on: Storage, request helpers (for alert polling)
- Used by: All views and hooks

**Routing & Auth Layer:**
- Purpose: Route definition, permission filtering, auth validation
- Location: `src/routes/`, `src/hooks/useActiveRoutes.js`, `src/modules/core/`
- Contains: Route arrays, hook-based filtering, MainContent wrapper
- Depends on: Context (user, permissions), storage (token validation)
- Used by: App.jsx (route rendering), protected views

**Request/API Layer:**
- Purpose: HTTP communication with backend, token management
- Location: `src/utils/js/request.js`, `src/utils/routes/app.routes.js`
- Contains: Axios instances (authenticated, public, file upload), endpoint resolution by VITE_ENTORNO
- Depends on: Storage (token retrieval)
- Used by: All views, hooks making API calls

**Storage/Persistence Layer:**
- Purpose: Platform-aware persistence and token storage
- Location: `src/storage/cookies-store.js`, `src/storage/storage.js`
- Contains: Tauri Store wrapper, localStorage JSON serialization, async data access
- Depends on: @tauri-apps/plugin-store (Tauri only), js-cookie (web fallback)
- Used by: Request layer (token), Context (user/tenant), auth flows

## Data Flow

### Primary Request Path (User Action → API → State → Render)

1. **User initiates action** (e.g., add chart, save diagram, fetch alerts)
   - Component calls `request()` or `requestFile()` from `src/utils/js/request.js`
   
2. **Token injection** (`request.js` line 9-12)
   - First checks `@tauri-apps/plugin-store` via `getData('token')` (async)
   - Falls back to `storage.get('tokenCooptech')` from localStorage
   - Injects as `Authorization: Bearer {token}` header
   
3. **Backend response** (line 14-25)
   - Axios sends request to backend resolved from `src/utils/routes/app.routes.js`
   - Backend URL determined by `VITE_APP_NAME` and `VITE_ENTORNO` env vars
   - Credentials included via `withCredentials: true`
   
4. **State update** (in component or Context)
   - Response data flows to useState or MainContext setter
   - Example: `Home` component fetches dashboard charts, stores in `setCharts()`
   
5. **Re-render** (React updates DOM)
   - Component reads state, renders updated UI
   - Nested components receive props, re-render

### Alert Polling Flow

1. **MainContext mounts** (`src/context/MainContext.jsx` line 32-38)
   - `useEffect` runs when `client` changes (tenant selected)
   - Calls `fetchUnreadCount()` immediately, then every 15 seconds
   
2. **Fetch unread count** (line 22-30)
   - Calls `request()` to `/alerts/unread-count` endpoint
   - Sets `unreadCount` state on success, logs error on fail
   
3. **NavBarCustom subscribes** (`src/modules/NavBarCustom/views/index.jsx` line 27)
   - Reads `unreadCount` from MainContext
   - Renders badge with count in UI

### Multi-Tab Detection (TabContext)

1. **App initializes TabProvider** (`src/main.jsx` line 10)
   - TabProvider wraps entire app at root
   
2. **TabContext initialization** (`src/context/TabContext.jsx` line 8-80)
   - Generates unique tabId on first render
   - Creates BroadcastChannel('app-channel')
   - Attempts to claim activeTabId in localStorage
   
3. **Another tab opens same app** (line 28-49)
   - New tab's BroadcastChannel receives 'activate' message
   - Shows SweetAlert2 blocking dialog asking user to close or reload
   - If user confirms: reloads this tab and becomes active
   - If user denies: redirects to VITE_COOPTECH_URL

### Client-Specific Route Overrides

1. **useActiveRoutes hook** (`src/hooks/useActiveRoutes.js` line 13-28)
   - Takes `isExternalUser` and `client` (tenant name) as inputs
   
2. **Route filtering** (line 14-20)
   - If external user (profile ID 5): returns only `externalRoutes`
   - If has overrides in `clientRouteOverrides` (e.g., 'Rio Tercero'): applies element replacements
   - Otherwise: returns standard `userRoutes`
   
3. **App renders filtered routes** (`src/App.jsx` line 48-51)
   - Maps active routes to Route components
   - Custom route element substitution works transparently to router

**State Management:**
- User/tenant info: localStorage + Tauri Store via storage/cookies-store abstraction
- Global UI state: MainContext (darkMode, tabActive, infoNav, etc.)
- Local component state: useState within each feature
- No Redux/Zustand—all global state is Context

## Key Abstractions

**Request Abstraction** (`src/utils/js/request.js`):
- Purpose: Three HTTP helpers — authenticated, public, file upload
- Example: `request('/api/charts', 'GET')` auto-injects JWT from storage
- Handles 500 errors by parsing response.data error messages
- File uploads use hardcoded accesskey/secretkey (security concern—see CONCERNS.md)

**Storage Abstraction** (`src/storage/cookies-store.js`):
- Purpose: Unified API for Tauri Store vs browser localStorage
- Example: `await saveData('token', jwt)` → Tauri Store if app, localStorage if web
- Async interface (required for Tauri Store)
- Fallback: catches errors, logs to console

**Route Filtering** (`src/hooks/useActiveRoutes.js`):
- Purpose: Dynamic route rendering based on user profile and tenant
- Example: 'Rio Tercero' tenant overrides `/` and `/home` to render `<Boards/>` instead of `<Home/>`
- Memoized to prevent re-renders on unrelated state changes

**Module Architecture** (Feature Folders):
- Pattern: Each module (e.g., `src/modules/Charts/`) contains `views/`, `components/`, `utils/`, `hooks/`, `configs/`
- Isolation: Components rarely import across modules except from `src/components/` (reusable UI)
- Example: `src/modules/DrawDiagram/` is self-contained with Konva integration, hooks, and utilities

**Platform Detection** (`src/storage/cookies-store.js` line 8):
- Uses `window.isTauri` flag (set by Tauri at app startup)
- Allows same code to branch: Store API for Tauri, Cookies for web

## Entry Points

**Web Entry Point:**
- Location: `index.html` line 31 → `src/main.jsx`
- Vite dev server: port 1420 (required for Tauri)
- Renders React root, mounts contexts, starts SPA

**Desktop Entry Point (Tauri v2):**
- Location: `src-tauri/tauri.conf.json` lines 5-9
  - `beforeDevCommand`: `npm run dev`
  - `beforeBuildCommand`: `npm run build`
  - `devUrl`: `http://localhost:1420`
  - `frontendDist`: `../dist` (built React app)
- Launches Vite dev server, wraps in Tauri window
- Targets: Windows MSI, Linux DEB/RPM/AppImage, macOS DMG
- Auto-update: configured at line 39-44, points to GitHub releases

**Environment Configuration:**
- `VITE_ENTORNO`: `local` | `desarrollo` | `production` — selects backend URL
- `VITE_APP_NAME`: Application identifier (e.g., 'Mas Agua') — selects service endpoints
- `VITE_COOPTECH_URL`: Fallback redirect if multi-tab blocker fires
- `.env` file exists (not read due to secret policy)

## Architectural Constraints

- **Threading:** Single-threaded event loop (React/Vite). Tauri plugins (store, updater) use async/await; no worker threads.
- **Global state:** MainContext and TabContext are the only global state containers. No module-level singletons except `storage` wrapper object.
- **Circular imports:** Not detected during exploration; modules are isolated by feature folder.
- **Token storage:** Dual-target (Tauri Store + localStorage) requires async storage access in request layer, adding `await` calls.
- **Request timeout:** Axios default is 0 (infinite). No custom timeout configured; can hang on poor connections.
- **CORS:** `withCredentials: true` requires backend CORS headers matching frontend origin.
- **Storage size:** localStorage is ~5–10 MB per origin; large datasets (e.g., full chart history) should not be persisted locally.
- **Tauri window constraints:** Single window only (fixed in `tauri.conf.json` line 21). Desktop multi-window not supported.

## Anti-Patterns

### Hardcoded Credentials in Request Layer

**What happens:** `requestFile()` in `src/utils/js/request.js` lines 83-84 includes hardcoded `accesskey` and `secretkey` in every file upload request.

**Why it's wrong:** Credentials are exposed in browser DevTools Network tab and in bundle if minified. Any user with inspector access can exfiltrate these keys and upload arbitrary files.

**Do this instead:** Move accesskey/secretkey to backend. Proxy file uploads through authenticated `/api/upload` endpoint that retrieves keys from environment, generates signed URLs, or directly uploads on behalf of client.

### 15-Second Alert Poll Without Debounce

**What happens:** `MainContext.jsx` line 36 sets `setInterval(fetchUnreadCount, 15000)` unconditionally, running even if tab is idle or in background.

**Why it's wrong:** Wastes network requests, battery (on mobile), and spams backend on production with hundreds of tenants × users. No backoff if alerts are not changing.

**Do this instead:** Use exponential backoff; stop polling if tab loses focus via `document.hidden` check; or switch to WebSocket/Server-Sent Events for push notifications (commented Socket.io code suggests this was attempted).

### No Pagination in Chart/Table Views

**What happens:** Views like `Home` and chart configuration screens fetch and render entire datasets without pagination or virtual scrolling.

**Why it's wrong:** Loading 10,000 chart definitions into `useState` causes UI lag, memory bloat, and slow initial render.

**Do this instead:** Implement cursor-based or offset pagination. Use Material-React-Table's built-in pagination (already a dependency). Load-on-scroll for infinite lists.

### BroadcastChannel Tab-Kill with Reload

**What happens:** `TabContext.jsx` line 43 calls `window.location.reload()` when a second tab activates, forcing full page reload in competing tabs.

**Why it's wrong:** Disrupts UX if user intentionally opens multiple tabs. No graceful shutdown—WebSocket connections, unsaved form state, ongoing uploads all lost.

**Do this instead:** Allow multiple tabs; sync state via BroadcastChannel instead of killing tabs. Or use a session/tab manager (e.g., `use-context-selector`) to isolate each tab's state.

## Error Handling

**Strategy:** Try-catch with Swal.fire() dialogs for user-facing errors. Axios error responses parsed for backend messages.

**Patterns:**

1. **Request-level** (`src/utils/js/request.js` lines 26-38):
   - If 500: extract error messages from response.data object
   - Otherwise: throw full error for caller to handle
   
2. **Component-level** (e.g., `LoginApp` line 99):
   - Wrap `await request()` in try-catch
   - On error: `Swal.fire()` with `error.response?.data?.error` or `error.message`
   - Clear sensitive data (token, usuario) from storage on auth failure
   
3. **Async operation** (e.g., `Home` chart fetch):
   - `setLoading(true)` before request
   - On error: log to console, do NOT clear loading state (user sees spinner)
   - No user notification (silent fail)—inconsistent pattern

**Gap:** No global error boundary. React Suspense not used. No retry logic on transient failures.

## Cross-Cutting Concerns

**Logging:** `console.log/error` scattered throughout. No centralized logging, no log levels, no remote logging. Example: `MainContext.jsx` line 28, `request.js` line 31.

**Validation:** React Hook Form in login and chart config. DataGenerator component handles dynamic field validation. No schema validation (Zod is imported but unused).

**Authentication:** JWT via Cooptech SSO. Token stored in Tauri Store or localStorage. Decoded on login, stored as `usuario` object. No token refresh logic; relies on long-lived tokens.

---

*Architecture analysis: 2026-04-27*
