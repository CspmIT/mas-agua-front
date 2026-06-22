# Coding Conventions

**Analysis Date:** 2026-04-27

## Naming Patterns

**Files:**
- **Components:** PascalCase for main component files (`DrawDiagram.jsx`, `ButtonCustom.jsx`, `PageHeader.jsx`)
- **Utilities & Hooks:** camelCase for utility modules and custom hooks (`useActiveRoutes.js`, `useDiagramState.js`, `request.js`, `app.routes.js`)
- **Index files:** `index.jsx` used as barrel file export for component directories (e.g., `src/components/ButtonCustom/index.jsx`, `src/modules/alert/views/index.jsx`)
- **CSS modules:** camelCase with `.module.css` extension (`styles.module.css`)
- **Utilities:** camelCase JS files in `utils/js/` directories (e.g., `ListImg.js`, `drawActions.js`, `parseAlarm.js`)

**Functions:**
- **Components & Hooks:** PascalCase for component functions (`BoardChart`, `ChartComponentDbWrapper`, `NavBarCustom`)
- **Utility functions & exports:** camelCase for helper functions (`formatValue()`, `formatUnit()`, `resolveValue()`, `markAsRead()`)
- **Async functions:** Clear action names prefixed with verb (`fetchUnreadCount()`, `getUsers()`, `uploadCanvaDb()`, `markAllAsRead()`)

**Variables:**
- **State:** camelCase (`darkMode`, `isLoading`, `selectedId`, `tabActive`)
- **Refs:** camelCase with "Ref" suffix (`stageRef`, `transformerRef`, `NavBarRef`)
- **Constants:** UPPER_SNAKE_CASE for module-level constants (`EXTERNAL_PROFILE_ID`, `PAGE_SIZE`, `BOTTOM_KEYS`)
- **Boolean flags:** Prefix with `is`, `has`, `show`, or `can` (`isExternalUser`, `isDraggingStage`, `showImageSelector`, `canvasAreaSx`)

**Types:**
- No TypeScript used; plain JavaScript with JSDoc comments for documentation (`@param`, `@returns`)

## Code Style

**Formatting:**
- No linting configuration detected (`.eslintrc`, `.prettierrc`, or `biome.json` not present per CLAUDE.md)
- **Indentation:** Mix of tab and space indentation observed across files; no enforced convention
- **Line length:** No enforced limit observed; lines range from 80–150+ characters
- **Semicolons:** Inconsistent — some files use semicolons, others omit them (e.g., `App.jsx` uses semicolons; `DrawDiagram.jsx` omits them)
- **Arrow functions:** Preferred for callbacks and utility functions
- **Object/Array formatting:** Multi-line objects and arrays generally aligned for readability

**Linting:**
- **Tool:** None configured (per CLAUDE.md)
- **Recommendations:** Consider ESLint + Prettier for consistency across the 189+ source files

## Import Organization

**Order:**
1. React and hooks from `react` library
2. Material-UI components and icons (`@mui/material`, `@mui/icons-material`)
3. Joy UI components (if used in same file)
4. Third-party libraries (routing, forms, icons, utilities)
5. Tauri API imports (`@tauri-apps/api/*`)
6. Local module imports (context, components, utils, hooks)
7. CSS/style imports (`.css`, `.module.css`)

**Example from `src/modules/alert/views/index.jsx`:**
```javascript
import { useContext, useEffect, useMemo, useState } from 'react'
import { Container, IconButton, Tooltip } from '@mui/material'
import Swal from 'sweetalert2'
import { FaEye } from 'react-icons/fa'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import LoaderComponent from '../../../components/Loader'
import PageHeader from '../../../components/PageHeader'
import { MainContext } from '../../../context/MainContext'
import AlarmCard from '../components/AlarmCard'
```

**Path Aliases:**
- No path aliases configured; relative paths used throughout (`../../../utils/js/request`)
- Consistent use of relative imports from project root within module structures

## Error Handling

**Patterns:**
- **Axios requests:** Wrapped in try-catch blocks with error differentiation:
  - 500 errors: Message extraction from `error.response.data`
  - Other errors: Pass full error object or `error.response.data`
  - All errors logged to console with `console.error()`
  
**Example from `src/utils/js/request.js`:**
```javascript
export const request = async (url, method, data = false) => {
	try {
		const response = await axios({...})
		return response
	} catch (error) {
		if (error.response?.status === 500) {
			let messageError = ''
			const errors = error.response.data
			for (const key in errors) {
				if (Object.hasOwnProperty.call(errors, key)) {
					messageError += ' ' + errors[key].message
				}
			}
			throw messageError
		} else {
			throw error
		}
	}
}
```

- **User-facing errors:** SweetAlert2 (`Swal.fire()`) modals for error messages
  - Example from `src/modules/alert/views/index.jsx`:
  ```javascript
  Swal.fire({
    title: 'Error',
    text: 'No se pudieron obtener los datos de las alarmas.',
    icon: 'error',
  })
  ```
- **Validation:** Form validation via `react-hook-form` with `Controller` wrapper for MUI components
- **Loading states:** Boolean `loading`/`isLoading` state managed per component or hook

## Logging

**Framework:** `console` object (no dedicated logging library)

**Patterns:**
- `console.error(error)` in catch blocks for all async operations
- `console.log()` for debugging (sparingly, e.g., form data inspection in `ConfigMenu`)
- No structured logging; plain error objects or strings logged
- Error context usually provided in catch block comment (e.g., `'Error al obtener alertas no leídas'`)

**Common patterns:**
```javascript
const fetchUnreadCount = async () => {
  try {
    const { data } = await request(`${url}/alerts/unread-count`, 'GET')
    setUnreadCount(Number(data.count) || 0)
  } catch (error) {
    console.error('Error al obtener alertas no leídas', error)
  }
}
```

## Comments

**When to Comment:**
- JSDoc comments on exported functions and hooks (e.g., `useActiveRoutes`)
- Inline comments for complex logic blocks (Spanish comments observed)
- Section dividers in JSX (e.g., `{/* Rutas públicas (login) */}`) to separate UI regions
- Comments on constants explaining module state or behavior

**JSDoc/TSDoc:**
- Minimal usage; when present, uses standard JSDoc format:
  ```javascript
  /**
   * Devuelve las rutas activas aplicando los overrides del cliente si existen.
   *
   * @param {boolean} isExternalUser
   * @param {string|null} client
   * @returns {Array<{ path: string, element: JSX.Element }>}
   */
  export function useActiveRoutes(isExternalUser, client) { ... }
  ```

## Function Design

**Size:**
- Most functions 30–100 lines; larger components may reach 200–300 lines (e.g., `DrawDiagram.jsx`)
- Extraction of helper functions observed for repeated logic (e.g., `formatValue()`, `resolveValue()` in `BoardChart.jsx`)

**Parameters:**
- Destructured parameters preferred for multiple arguments
- Default parameters used for optional state (e.g., `const [elements, setElements] = useState([])`)
- Props passed as object destructuring in component signatures

**Return Values:**
- Async functions return response object or throw errors
- Hooks return objects with state and setter pairs, often with 5–10+ related functions
- Utility functions return computed values, JSX elements, or transformed data

**Example hook return from `useDiagramState.js`:**
```javascript
return {
  elements,
  setElements,
  selectedId,
  setSelectedId,
  deletedItems,
  setDeletedItems,
  handleDeleteElement,
  moveElementToBack,
  moveElementToFront
};
```

## Module Design

**Exports:**
- **Components:** `export default ComponentName` (single default export per component file)
- **Utilities:** Named exports preferred (`export const request`, `export const requestPublic`, `export const useVars`)
- **Contexts:** Both default and named exports (`export { MainContext, MainProvider }`)
- **Hooks:** Named export with `export function` or `export const` syntax

**Barrel Files:**
- Index files re-export components for cleaner imports from package directories
- Example: `src/components/ButtonCustom/index.jsx` exports `ButtonCustom` as default
- Reduces import path depth (`import ButtonCustom from 'src/components/ButtonCustom'` vs. full path)

## Styling Approach

**MUI sx Prop:**
- Primary styling mechanism for Material-UI components
- Objects defined inline or extracted as constants
- Example from `src/components/PageHeader.jsx`:
  ```javascript
  const primaryActionSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 1,
    '&:hover': { boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)' },
  }
  ```

**Tailwind CSS:**
- Used alongside MUI for utility classes
- Mixed approach: `sx` for component-specific styling, Tailwind for layout and spacing
- Example: `className="flex items-center justify-between gap-3"` combined with MUI `<Box>` components

**Inline Styles:**
- Avoided in favor of `sx` and `className`

**Dark Mode:**
- Managed via `darkMode` state in `MainContext`
- Tailwind dark mode strategy: `selector` (class-based, not media query)
- Dark variants applied via `dark:` prefix in Tailwind classes (e.g., `dark:bg-zinc-700`, `dark:text-gray-100`)
- MUI theme created dynamically in `App.jsx` based on `darkMode` boolean

---

*Convention analysis: 2026-04-27*
