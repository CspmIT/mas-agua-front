import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { useContext, useEffect, useMemo } from 'react'
import { isTauri } from '@tauri-apps/api/core'
import MainContent from './modules/core/views'
import { MainContext } from './context/MainContext'
import { storage } from './storage/storage'
import { useUpdater } from './hooks/useUpdater'
import { useActiveRoutes } from './hooks/useActiveRoutes'
import { loginRoutes } from './routes/loguin.Routes'
import './App.css'

const EXTERNAL_PROFILE_ID = 5

function App() {
	const { checkForUpdates } = useUpdater()
	const { darkMode } = useContext(MainContext)

	const authUser = useMemo(() => storage.get('usuario'), [])
	const isExternalUser = authUser?.profile === EXTERNAL_PROFILE_ID
	const nameApp = authUser?.nameApp ?? null  

	const theme = useMemo(
		() => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
		[darkMode]
	)

	// Rutas activas según perfil y cliente
	const activeRoutes = useActiveRoutes(isExternalUser, nameApp)

	useEffect(() => {
		if (isTauri()) {
			checkForUpdates()
		}
	}, [checkForUpdates])

	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<Routes>
					{/* Rutas públicas (login) */}
					{loginRoutes.map(({ path, element }) => (
						<Route key={path} path={path} element={element} />
					))}

					{/* Rutas protegidas dentro del layout principal */}
					<Route element={<MainContent />}>
						{activeRoutes.map(({ path, element }) => (
							<Route key={path} path={path} element={element} />
						))}

						{isExternalUser && (
							<Route path="*" element={<Navigate to="/" replace />} />
						)}
					</Route>
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	)
}

export default App