---
doc_type: codebase-map
focus: tech
last_mapped_at: 2026-04-27
---

# Technology Stack

**Analysis Date:** 2026-04-27

## Languages

**Primary:**
- **JavaScript (ES Modules)** — React application code, bundled with Vite. `package.json` declares `"type": "module"`.
- **Rust (Edition 2021)** — Tauri v2 desktop wrapper, compiled to native installers (`src-tauri/`).

**Secondary:**
- **HTML / CSS** — Markup and Tailwind utility styling.
- **TypeScript types only** — `@types/react`, `@types/react-dom` are installed, but the project is JSX-only (no `.ts`/`.tsx` source files).

## Runtime

**Environment:**
- Node.js v20 (declared in CI workflows)
- Rust stable toolchain (desktop builds)

**Package Manager:**
- npm (lockfile: `package-lock.json`)

## Frameworks

**Core:**
- `react` 18.2.0 — UI framework
- `react-router-dom` 6.21.1 — SPA client routing
- `vite` 6.3.2 — Dev server / bundler (dev port locked to **1420** for Tauri)

**Desktop / Platform (Tauri v2):**
- `@tauri-apps/api` 2.9.1
- `@tauri-apps/cli` 2.9.6
- `@tauri-apps/plugin-store` 2.4.2 — persistent JSON store for desktop
- `@tauri-apps/plugin-updater` 2.9.0 — GitHub-releases auto-updater
- `@tauri-apps/plugin-process` 2.3.1
- Rust deps in `src-tauri/Cargo.toml`

**UI Components:**
- `@mui/material` 5.15.10 + `@mui/icons-material` 5.15.10
- `@mui/joy` 5.0.0-beta.30 — Joy UI (beta) used in newer surfaces
- `@mui/x-data-grid` 6.19.3
- `tailwindcss` 3.4.3 — utility classes; runs alongside MUI

**State & Forms:**
- React Context API only — `MainContext` and `TabContext` (no Redux / Zustand / Jotai)
- `react-hook-form` 7.51.3
- `zod` 3.24.4

**Charting & Visualization:**
- `echarts` 5.5.1 + `echarts-liquidfill` 3.1.0
- `highcharts` 12.4.0 + `highcharts-react-official` 3.2.3 (premium, used selectively)

**Diagram / Canvas:**
- `konva` 9.3.20 + `react-konva` 18.2.10 + `use-image` 1.1.1 — backs the `DrawDiagram` editor

**Mapping:**
- `maplibre-gl` 5.1.0 + `react-map-gl` 8.0.1 — used by the `Map` module

**Data & HTTP:**
- `axios` 1.7.4
- `socket.io-client` 4.8.1 (configured but currently commented out — see `INTEGRATIONS.md`)
- `dayjs` 1.11.11
- `expr-eval` 2.0.2 — runtime expression evaluator for calculated variables
- `jwt-decode` 4.0.0

**Drag & Drop / Layout:**
- `@dnd-kit/core` 6.1.0 + `@dnd-kit/sortable` 8.0.0
- `react-grid-layout` 1.4.4 — draggable dashboard grid

**Export & File Handling:**
- `jspdf` 3.0.1 + `jspdf-autotable` 5.0.2
- `export-to-csv` 1.3.0

**Notifications:**
- `sweetalert2` 11.6.13 — modal alerts (primary error UX)
- `react-toastify` 10.0.5 — toast notifications
- Firebase Cloud Messaging — push notifications (config in `src/firebase.js`)

**Styling:**
- `@emotion/react` 11.11.4 + `@emotion/styled` 11.11.0 (MUI dependency)
- `tailwindcss` 3.4.3 with `darkMode: 'selector'`
- `postcss` 8.4.38 + `autoprefixer` 10.4.19

**Other:**
- `dotenv` 16.4.5
- `js-cookie` 3.0.5 — web fallback for storage abstraction
- `react-icons` 4.12.0
- `@formkit/tempo` 0.1.2 — time picker
- `@grpc/grpc-js` 1.10.9

## Configuration

**Build-time env vars (Vite — all `VITE_*` are public/bundled into client):**
- `VITE_APP_NAME` — selects backend in `src/utils/routes/app.routes.js` (e.g. `"Mas Agua"`, `"Reconecta"`)
- `VITE_ENTORNO` — `local` | `desarrollo` | `production`
- `VITE_COOPTECH_URL` — Cooptech SSO redirect base
- `.env` file is present at repo root (not readable here)

**Build / config files:**
- `vite.config.js` — dev server pinned to 1420
- `tailwind.config.js` — custom palette (`primary` `#368bed`, `secondary` `#d8621d`, `accent` `#10B981`); `darkMode: 'selector'`
- `postcss.config.js`
- `src-tauri/tauri.conf.json` — bundle targets (msi, deb, rpm, appimage, dmg) + updater endpoint
- `src-tauri/Cargo.toml`

**Notable config behavior:**
- Backend URL is resolved at runtime in `src/utils/routes/app.routes.js` from `VITE_ENTORNO` × `VITE_APP_NAME`.
- Storage abstraction at `src/storage/cookies-store.js` switches between `@tauri-apps/plugin-store` (desktop) and `js-cookie` / `localStorage` (web).
- All Axios requests use `withCredentials: true` (`src/utils/js/request.js`).

## Platform Requirements

**Development:**
- Node.js 20
- Rust stable (only required for desktop builds)
- `npm run dev` — Vite on `http://localhost:1420`
- `npm run tauri dev` — desktop dev shell

**Production — Web:**
- Multi-stage Docker build → Nginx serving SPA on port 80
- Image pushed to Docker Hub by `.github/workflows/cd_master.yaml`

**Production — Desktop:**
- Tauri produces per-OS installers via `.github/workflows/cd_desktop.yaml`
- Auto-update served from GitHub Releases (`latest.json`)
