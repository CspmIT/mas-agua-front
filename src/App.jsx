import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainContent from './modules/core/views'
import { ThemeProvider, createTheme } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { MainContext } from './context/MainContext'
import { storage } from '../src/storage/storage'

import LoginApp from './modules/LoginApp/view'
import ListClients from './modules/LoginApp/view/ListClient'
import TabDinamic from './modules/tabs/views'
import Notification from './modules/Notification'
import Home from './modules/home/views'
import './App.css'
import ConfigMenu from './modules/ConfigMenu/view'
import Profile from './modules/profile/views'
import Notifications from './modules/ConfigNotifications/views/index'
import ConfigSecurity from './modules/configSecurity/views'
import LoginCooptech from './modules/LoginApp/view/LoginCooptech'
import AddMenu from './modules/ConfigMenu/components/AddMenu'
import ListDrawDiagram from './modules/DrawDiagram/views/ListDrawDiagram'
import DrawDiagram from './modules/DrawDiagram/views/DrawDiagram'
import SelectType from './modules/Charts/views/SelectType'
import ConfigGraphic from './modules/Charts/views/ConfigGraphic'
import ViewDiagram from './modules/DrawDiagram/views/ViewDiagram'
import PumpControl from './modules/Charts/views/ConfigBombs'
import ChartsTable from './modules/Charts/views/ChartsTable'
import MapView from './modules/Map/Views/MapView'
import Maps from './modules/Map/Views/Maps'
import Vars from './modules/ConfigVars/views/Vars'
import ProfilePLC from './modules/ProfilePLC/views/ProfilePLC'
import ConfigBooleanChart from './modules/Charts/views/ConfigBooleanChart'
import NotFound from './modules/Errors/Not-Found'
import ChartsDashboard from './modules/dashBoard/views/ChartsDashboard'
import ConfigPie from './modules/Charts/views/ConfigPie'
import Alert from './modules/alert/views'
import ConfigAlarms from './modules/ConfigAlarms/views/index'

import ExternalUser from './modules/ExternalUsers/views/index'


function App() {
	const { darkMode } = useContext(MainContext)
	const authUser = storage.get('usuario')
	const isExternalUser = authUser && authUser.profile === 5

	const loginRoutes = [
		{ path: '/login', element: <LoginApp /> },
		{ path: '/ListClients', element: <ListClients /> },
		{ path: '/ListClients/:action', element: <ListClients /> },
		{ path: '/LoginCooptech/:token', element: <LoginCooptech /> },
		{ path: '/*', element: <NotFound /> },
	]
	const userRoutes = [
		{ path: '/', element: <Home /> },
		{ path: '/home', element: <Home /> },
		{ path: '/chart', element: <ChartsDashboard /> },
		{ path: '/tabs', element: <TabDinamic /> },
		{ path: '/config/security', element: <ConfigSecurity /> },
		{ path: '/config/menu', element: <ConfigMenu /> },
		{ path: '/notificaciones', element: <Notification /> },
		{ path: '/profile', element: <Profile /> },
		{ path: '/config/notifications', element: <Notifications /> },
		{ path: '/config/diagram', element: <ListDrawDiagram /> },
		{ path: '/newDiagram', element: <DrawDiagram /> },
		{ path: '/newDiagram/:id', element: <DrawDiagram /> },
		{ path: '/viewDiagram/:id', element: <ViewDiagram /> },
		{ path: '/AddMenu', element: <AddMenu /> },
		{ path: '/config/graphic', element: <SelectType /> },
		{ path: '/config/pumps', element: <PumpControl /> },
		{ path: '/config/graphic/boolean', element: <ConfigBooleanChart /> },
		{ path: '/config/graphic/boolean/:id', element: <ConfigBooleanChart /> },
		{ path: '/config/graphic/pie', element: <ConfigPie /> },
		{ path: '/config/graphic/pie/:id', element: <ConfigPie /> },
		{ path: '/config/graphic/:id', element: <ConfigGraphic /> },
		{ path: '/config/graphic/:id/:idChart', element: <ConfigGraphic /> },
		{ path: '/config/allGraphic', element: <ChartsTable /> },
		{ path: '/map', element: <MapView /> },
		{ path: '/maps', element: <Maps /> },
		{ path: '/map/create', element: <MapView create={true} /> },
		{ path: '/map/edit', element: <MapView create={true} search={true} /> },
		{ path: '/config/vars', element: <Vars /> },
		{ path: '/config/plc', element: <ProfilePLC /> },
		{ path: '/alert', element: <Alert /> },
		{ path: '/config/alarm', element: <ConfigAlarms /> },

	]

	const externalRoutes = [
		{ path: '/', element: <ExternalUser /> }

	]

	//Incorporo el theme de mui
	const lightTheme = createTheme({
		palette: {
			mode: 'light',
		},
	})

	const darkTheme = createTheme({
		palette: {
			mode: 'dark',
		},
	})
	const [theme, setTheme] = useState(!darkMode ? darkTheme : lightTheme)
	useEffect(() => {
		setTheme(!darkMode ? lightTheme : darkTheme)
	}, [darkMode])

	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<Routes>
					{loginRoutes.map((route) => (
						<Route key={route.path} path={route.path} element={route.element} />
					))}

					<Route element={<MainContent />}>
						{(isExternalUser ? externalRoutes : userRoutes).map((route) => (
							<Route key={route.path} path={route.path} element={route.element} />
						))}

						{isExternalUser && <Route path="*" element={<Navigate to="/" />} />}
					</Route>
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	)
}

export default App
