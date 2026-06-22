---
doc_type: codebase-map
focus: tech
last_mapped_at: 2026-04-27
---

# External Integrations

**Analysis Date:** 2026-04-27

## APIs & External Services

**Mas Agua backend (own API):**
- Resolved in `src/utils/routes/app.routes.js` from `VITE_ENTORNO` × `VITE_APP_NAME`.
- Local: `http://localhost:4000/api`
- Desarrollo: dev backend host
- Production: `https://masagua.cooptech.com.ar/api`
- Time-series endpoints (e.g. `/getVarsInflux`) suggest an InfluxDB-like store on the backend.

**Cooptech ecosystem:**
- Cooptech: `https://dev.cooptech.com.ar` / `https://cooptech.com.ar` — root SSO portal
- Reconecta: `https://devreconecta.cooptech.com.ar` / `https://reconecta.cooptech.com.ar`
- Centinela / Cloud / Provision: `http://localhost:8082` (dev) — sibling internal apps
- Oficina Virtual: `https://oficinainterna.cooptech.com.ar`
- Frontend SSO entry point: `/LoginCooptech/:token` route in `src/routes/loguin.Routes.jsx`

## Data Storage

**Frontend persistence:**
- Desktop: `@tauri-apps/plugin-store` (JSON file in Tauri app data dir) — wrapped by `src/storage/cookies-store.js`
- Web: `js-cookie` / `localStorage` — same wrapper, same API surface
- Stored items: JWT, active client/tenant, user prefs, darkMode

**No frontend-side caching layer** (no Redis client, no SWR / React Query). Data is fetched per-mount and held in React Context.

**Object storage (file uploads):**
- MinIO S3-compatible bucket
  - Dev: `http://localhost:5000/minio`
  - Prod: `https://storageov.cooptech.com.ar/minio`
- Implementation: `requestFile()` in `src/utils/js/request.js`
- ⚠ Access/secret keys are read from `VITE_*` env vars and therefore **bundled into the client** — see `.planning/codebase/CONCERNS.md`.

## Authentication & Identity

**Auth model:**
- Custom JWT issued by Mas Agua backend on `/login`
- Token persisted via `src/storage/cookies-store.js`
- Token sent as `Authorization: Bearer <token>` by `request()` in `src/utils/js/request.js`
- Token decoded client-side with `jwt-decode` to read role / profile / claims
- All requests use `withCredentials: true`

**SSO:**
- Cooptech federated login via `/LoginCooptech/:token` (token-in-URL handoff)

**Three request helpers (`src/utils/js/request.js`):**
- `request(url, method, data)` — authenticated, JSON
- `requestPublic(url, method, data)` — no auth (e.g. login)
- `requestFile(url, method, data)` — multipart upload to MinIO using bundled access/secret keys

**Permissions / roles:**
- User profile decoded from JWT; role-based route filtering via `useActiveRoutes` (`src/hooks/useActiveRoutes.js`)
- External user profile (id `5`) gets a reduced route set (`src/routes/external.Routes.jsx`)

## Real-Time & Messaging

**Polling:**
- `MainContext` polls the backend every **15 seconds** for unread alert count.
- `NavBarCustom` performs a similar polling loop for notifications.

**WebSockets:**
- `socket.io-client` 4.8.1 is installed and the connection code exists in `src/modules/NavBarCustom/views/index.jsx` (~line 57) but is **commented out**. Not active in current builds.

**Push notifications (Firebase Cloud Messaging):**
- Config: `src/firebase.js`
- Project: `reconectadesarrollo` (Firebase project)
- VAPID public key configured for web push
- Integration surfaces: `src/modules/Notification/`, plus device-registration UI in `src/modules/ConfigNotifications/`
- Imports appear partially commented — feature is in progress.

> ⚠ The Firebase web config (apiKey, appId, etc.) is hard-coded in `src/firebase.js`. Firebase web API keys are intentionally public, **but** project-level Firebase Security Rules must enforce auth — flagged in `CONCERNS.md`.

## Monitoring & Observability

- **Error tracking:** none detected (no Sentry / Datadog / Bugsnag SDK).
- **Logging:** plain `console.log` / `console.error` scattered across modules.
- **Web server logs:** Nginx default access/error logs inside the Docker container.
- **No frontend telemetry / analytics** detected.

## CI/CD & Deployment

`.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `cd_master.yaml` | push to `master` | Bump tag (`anothrNick/github-tag-action`) → build & push Docker image to Docker Hub |
| `cd_dev.yaml` | push to `deployment` | Build & deploy dev Docker image |
| `cd_desktop.yaml` | push to `releases` | Tauri build matrix (windows-latest, ubuntu-latest, macos-latest) → GitHub Release with installers + `latest.json` |

**Docker build args:** `VITE_APP_NAME`, `VITE_ENTORNO`, plus `SECRET` (passed in from GH secrets — purpose not fully traced; appears to feed the build, not runtime).

**Tauri auto-update:**
- Endpoint: `https://github.com/CspmIT/mas-agua-front/releases/latest/download/latest.json`
- Public update key embedded in `src-tauri/tauri.conf.json`
- Client-side check via `useUpdater` hook (`src/hooks/useUpdater.js`)

## Webhooks & Inbound Callbacks

- No HTTP webhook receivers (frontend is SPA-only).
- FCM tokens flow **outbound** to backend during device registration in `src/modules/ConfigNotifications/`.
- `/LoginCooptech/:token` acts as an inbound deep-link from the Cooptech SSO portal.

## Outbound Calls Summary

| Direction | Channel | Where |
|-----------|---------|-------|
| Out | Axios (auth) | `request()` — most modules |
| Out | Axios (public) | `requestPublic()` — login flows |
| Out | Multipart S3 | `requestFile()` → MinIO |
| Out | FCM token register | `ConfigNotifications` |
| In  | SSO redirect | `/LoginCooptech/:token` |
| In  | Tauri update check | `useUpdater` → GitHub Releases |

---

*Integration audit: 2026-04-27*
