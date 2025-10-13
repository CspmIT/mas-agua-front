import { createContext, useEffect, useState } from 'react'
import { request } from '../utils/js/request'
import { backend } from '../utils/routes/app.routes'

const MainContext = createContext()

function MainProvider({ children }) {
	const [darkMode, setDarkMode] = useState(false)
	const [user, setUser] = useState(false)
	const [infoNav, setInfoNav] = useState('')
	const [tabActive, setTabActive] = useState(0)
	const [tabs, setTabs] = useState([])
	const [tabCurrent, setTabCurrent] = useState(0)
	const [permission, setPermission] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)

	const fetchUnreadCount = async () => {
		const url = backend[import.meta.env.VITE_APP_NAME]
		try {
		  const { data } = await request(`${url}/alerts/unread-count`, 'GET')
		  setUnreadCount(Number(data.count) || 0)
		} catch (error) {
		  console.error('Error al obtener alertas no leídas', error)
		}
	  }
	
	  useEffect(() => {
		fetchUnreadCount()
		const interval = setInterval(fetchUnreadCount, 10000)
		return () => clearInterval(interval)
	  }, [])

	useEffect(() => {
		if (tabs.length) {
			setTabActive(tabs.length)
		}
	}, [tabs])

	return (
		<MainContext.Provider
			value={{
				infoNav,
				setInfoNav,
				tabCurrent,
				setTabCurrent,
				tabActive,
				setTabActive,
				tabs,
				setTabs,
				user,
				setUser,
				darkMode,
				setDarkMode,
				permission,
				setPermission,
				unreadCount,
				setUnreadCount,
				fetchUnreadCount,
			}}
		>
			{children}
		</MainContext.Provider>
	)
}
export { MainContext, MainProvider }
