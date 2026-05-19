# Codebase Concerns

**Analysis Date:** 2026-04-27

## Security Issues

### Critical: Hardcoded Credentials in Source Code

**What happens:** MinIO access/secret keys are committed to version control as plaintext in the `requestFile` function.

**Files:** `src/utils/js/request.js` (lines 83-84)

**Impact:** These credentials are bundled into the public client bundle. Anyone with access to the app bundle (web or desktop) can extract these keys and abuse MinIO storage API.

**Current mitigation:** None.

**Fix approach:** 
- Move `accesskey` and `secretkey` to environment variables (`VITE_MINIO_ACCESS_KEY`, `VITE_MINIO_SECRET_KEY`)
- Use a backend endpoint to proxy file uploads instead of direct client access to MinIO
- Immediately rotate these keys in production

**Severity:** CRITICAL

---

### High: Mock User Passwords in Codebase

**What happens:** Complete user dataset with cleartext passwords is committed to version control in development/demo data.

**Files:** `src/modules/configSecurity/utils/DataTable/dataUser.js` (lines 1-119)

**Impact:** If this file is served publicly or accessed, it exposes multiple real credentials (emails + passwords). File contains domains like `coopmorteros.coop`, `devoto.coop` suggesting these may be real or test accounts at production systems.

**Workaround:** Currently used for demo/UI purposes only (not in actual user management flow).

**Fix approach:**
- Remove mock data from source code entirely
- If needed for development, place in `.env.local` (already in `.gitignore`)
- Or move to a dedicated dev-only module loaded only in development mode with clear warnings

**Severity:** HIGH

---

### High: Missing JWT Token Refresh Strategy

**What happens:** No token expiration detection or refresh mechanism is implemented. When JWT expires, the user gets silenced errors and broken features.

**Files:** `src/utils/js/request.js` (no 401/403 handling), `src/storage/cookies-store.js` (stores token but no expiry check)

**Impact:** Long-lived sessions can silently fail. API errors don't distinguish between "token expired" and other 500 errors. Users may not know they've been logged out.

**Current behavior:**
- Line 27-35 in `request.js`: Only catches 500 status, re-throws others without context
- No Axios interceptor for 401 responses
- No refresh token rotation
- No prompt to re-login

**Fix approach:**
- Add Axios interceptor to catch 401/403 status codes
- Implement token refresh endpoint call and retry logic
- Or redirect to login page on auth failure with clear messaging
- Add expiry claim (`exp`) validation in the client before 401 occurs

**Severity:** HIGH

---

### Medium: Client-Side Credential Storage

**What happens:** JWT token is stored in localStorage (fallback) and accessed directly from client code multiple times.

**Files:** `src/storage/cookies-store.js`, `src/utils/js/request.js` (line 9-11)

**Impact:** XSS vulnerabilities could expose JWT tokens. No HttpOnly flag possible with localStorage.

**Current approach:** Tauri Store is used when available (more secure), but web fallback is localStorage.

**Recommendations:**
- For web: Switch to HttpOnly cookies + CSRF tokens for sensitive endpoints
- Store JWT in memory and use refresh token in HttpOnly cookie
- Consider disabling client-side token storage for Tauri and fetching auth state from backend on startup

**Severity:** MEDIUM

---

## Tech Debt

### High: Hardcoded Development/Test IPs in Production Bundle

**What happens:** Hardcoded internal IPs are embedded in the build artifact and visible to users.

**Files:** `src/utils/routes/app.routes.js` (line 19, 34)

```javascript
'http://172.26.5.17:32000'  // Development IP exposed
'http://172.26.5.17:32001/api'  // Development IP exposed
```

**Impact:** 
- Reveals internal network topology to attackers
- May not work for external deployments
- Could expose internal services if they're accessible from client networks

**Fix approach:** Load all backend URLs from environment variables, never hardcode IPs. Use DNS names only.

**Severity:** HIGH

---

### High: Multiple Polling Intervals Without Cleanup Guarantee

**What happens:** Multiple components create `setInterval` calls that may not clean up properly if component unmounts during error state.

**Files:**
- `src/context/MainContext.jsx` (line 36): 15s alert polling
- `src/modules/DrawDiagram/views/ViewDiagram.jsx` (line 131): 15s Influx data polling
- `src/modules/dashBoard/components/ChartAcorddion.jsx` (line 136): 15s per-chart polling
- `src/modules/home/views/index.jsx` (line 335): 30s dashboard polling
- `src/modules/PumpsTable/views/index.jsx` (line 290): 30s pump status polling
- `src/modules/Map/Components/MapBase.jsx` (line 181): 15s map marker polling

**Impact:** Memory leaks over long sessions as intervals accumulate. High unnecessary load on backend with overlapping polling from 6+ separate intervals.

**Current state:** Cleanup is attempted in `useEffect` returns, but:
- No validation that interval cleanup actually runs
- If component throws during setup, cleanup may not register
- Multiple overlapping intervals fetch the same data repeatedly

**Fix approach:**
- Consolidate polling into a single global polling manager
- Use shared subscriptions instead of per-component intervals
- Implement debouncing for rapid-fire requests
- Consider using WebSocket instead for real-time data

**Severity:** HIGH

---

### Medium: Large Components with Mixed Concerns

**What happens:** Multiple components exceed 600+ lines with business logic, UI rendering, and state management intertwined.

**Files:**
- `src/modules/DrawDiagram/components/DiagramCanvas/DiagramCanvas.jsx` (670 lines)
- `src/modules/home/views/index.jsx` (614 lines)
- `src/modules/ConfigVars/components/ModalVarPLC.jsx` (576 lines)
- `src/modules/DataGenerator/DataGenerator.jsx` (572 lines)
- `src/modules/ConfigMenu/components/AddMenu/index.jsx` (561 lines)

**Impact:** Difficult to test, maintain, or modify individual features. High cognitive load for developers.

**Fix approach:**
- Break into smaller sub-components (max 300 lines)
- Extract business logic to hooks or services
- Create a component hierarchy with clear data flow

**Severity:** MEDIUM

---

## Fragile Areas

### Drawing Diagram Editor (Konva-based)

**Files:** `src/modules/DrawDiagram/` (entire module)

**Why fragile:**
- Manages complex Konva canvas state with 50+ props passed to `DiagramCanvas`
- Undo/redo not implemented, any error loses work
- Large dependent file: `drawActions.js` (381 lines) handles serialization

**Safe modification:**
- Test all Konva transformations with mock data before deploying
- Add canvas auto-save to localStorage as backup
- Add undo/redo stack implementation

**Test coverage:** No visible test files for this module.

**Severity:** HIGH

---

### Chart Data Pipeline

**Files:** `src/modules/dashBoard/components/ChartAcorddion.jsx`, `src/modules/Charts/` (entire module)

**Why fragile:**
- 50+ chart types with no unified rendering interface
- Chart factory pattern (`ChartFactory`) not visible but likely brittle
- Error on one chart type breaks accordion rendering

**Safe modification:**
- Add fallback/error boundary for unknown chart types
- Test every chart type after modifying query builder

**Test coverage:** No visible test files.

**Severity:** MEDIUM

---

### Multi-Tab Detection (BroadcastChannel)

**Files:** `src/context/TabContext.jsx`

**Why fragile:**
- BroadcastChannel has **no fallback for Safari < 15.1 or older browsers**
- Will silently fail on unsupported browsers, allowing multiple active tabs undetected
- Hard refresh causes race conditions in `localStorage.getItem('activeTabId')`

**Safe modification:**
- Add feature detection: `if (typeof BroadcastChannel === 'undefined')`
- Implement SharedWorker or polling-based fallback
- Add console warning if BroadcastChannel unavailable

**Severity:** MEDIUM

---

## Error Handling Gaps

### Silent Error Swallowing

**What happens:** Multiple catch blocks log errors to console but don't surface them to users.

**Files:**
- `src/storage/cookies-store.js` (lines 31, 45, 60): Storage errors logged but not surfaced
- `src/modules/configSecurity/components/EditUserRecloser/EditUserRecloser.jsx` (line 41): Empty catch block
- `src/modules/Notification/index.jsx` (line 15): Error only logged, Firebase token failure not shown to user

**Impact:** Users don't know why features fail. Storage failures go unnoticed.

**Fix approach:** For each error, either:
1. Show user-facing toast/alert
2. Retry with backoff
3. Fallback to alternative behavior

**Severity:** MEDIUM

---

## Missing Test Coverage

**What's not tested:**
- Authentication flow (login, token storage, 401 handling)
- Chart rendering with various data types
- Diagram editor canvas operations
- Polling interval cleanup
- Multi-tab detection fallbacks

**Risk:** Regressions in critical paths go undetected until production.

**Severity:** MEDIUM

---

## Unused Imports & Dead Code

### Unused Imports

**File:** `src/modules/DrawDiagram/utils/js/drawActions.js` (line 4)

```javascript
import { data } from 'autoprefixer'  // Never used
```

**Impact:** Minimal, but signals incomplete cleanup.

**Severity:** LOW

---

### Firebase Module Partially Disabled

**File:** `src/modules/Notification/index.jsx` (entire file)

**What happens:** Firebase integration is commented out but code references undefined globals (`signInAnonymously`, `getAuth`, `getToken`, `onMessage`, `messaging`).

**Lines:** 9, 13, 14, 24

**Impact:** This component will throw ReferenceError at runtime if rendered.

**Fix approach:** Either fully remove or un-comment imports and initialize Firebase.

**Severity:** MEDIUM

---

## Styling System Duplication

**What happens:** Three competing style systems are bundled together.

**Files:** 
- MUI v5 (`@mui/material`, `@mui/joy`) with Emotion
- Tailwind CSS (utility classes)
- Inline styles (scattered throughout)

**Impact:** 
- Bundle size bloated (3 CSS engines)
- Conflicting utility names (e.g., `p-4` vs `px-2`)
- Maintenance burden when updating one system

**Example conflicts:**
- `src/modules/home/views/index.jsx`: Mixes `className="grid grid-cols-1..."` (Tailwind) with `<Box sx={{...}}>` (MUI)
- Tailwind dark mode uses `selector` strategy but MUI may override

**Fix approach:**
- Choose one primary system (recommend MUI + Emotion for consistency)
- Remove Tailwind or use only for utility-heavy components
- Create design tokens file to avoid duplication

**Severity:** MEDIUM

---

## Performance Concerns

### No Bundle Size Optimization

**What's included:**
- Entire ECharts library (~800KB) for 1 chart type
- Highcharts (~400KB) also included
- Konva (~200KB) for drawing
- MapLibre GL (~500KB) for map view
- All bundled into single app.js

**Impact:** Desktop app startup slower, web version slower on slow networks.

**Visibility:** No tree-shaking config visible in build.

**Recommendations:**
- Code-split chart components by type
- Lazy-load drawing editor and map only when needed
- Analyze bundle with `vite-plugin-visualizer`

**Severity:** MEDIUM

---

### Missing CORS Preflight Optimization

**Files:** `src/utils/js/request.js` (line 18: `withCredentials: true`)

**Impact:** All requests are preflighted (OPTIONS before actual request), doubling network round trips. No caching of preflight response.

**Recommendations:**
- Add `Access-Control-Max-Age: 86400` header on backend
- Use preflight-safe request headers only (avoid custom headers when possible)

**Severity:** LOW

---

## Environmental Configuration Gaps

### No Environment Validation

**Files:** `src/main.jsx`, `src/App.jsx`

**What's missing:**
- No check that required `VITE_*` variables are set
- If `VITE_ENTORNO` is missing, silently falls back to undefined
- No validation that backend URLs are reachable at startup

**Impact:** Cryptic errors if deployment is misconfigured.

**Fix approach:** Add startup validation hook that checks all required env vars before rendering app.

**Severity:** LOW

---

## Deployment Concerns

### Desktop Auto-Updater Uses GitHub Releases

**Files:** `src-tauri/tauri.conf.json` (line 41)

**What happens:** Auto-updater pulls binary releases directly from GitHub.

**Risks:**
- If GitHub account is compromised, malicious updates deployed
- No delta updates (full binary download each time)
- No staged rollout

**Recommendations:**
- Host releases on private artifact repository
- Implement staged rollout with rollback
- Use signed updates (already has pubkey, line 43)

**Severity:** MEDIUM

---

## Known Issues in Current Branch

**Branch:** `feat-dashboard-layout`

**Uncommitted changes affect:** DrawDiagram, NavBarCustom, alert modules

**Impact:** Incomplete feature state may cause regressions. New file `src/modules/DrawDiagram/utils/js/diagramTheme.js` not yet integrated.

**Files with modifications:**
- `src/modules/DrawDiagram/components/DiagramCanvas/DiagramCanvas.jsx` (M)
- `src/modules/DrawDiagram/views/DrawDiagram.jsx` (M)
- `src/modules/DrawDiagram/views/ViewDiagram.jsx` (M)
- `src/modules/alert/views/index.jsx` (M)
- Several NavBarCustom components (M)
- Deleted: `src/modules/alert/components/AlarmRow.jsx` (D)

**Recommendation:** Complete feature branch and merge to main before applying any security fixes above.

---

*Concerns audit: 2026-04-27*
