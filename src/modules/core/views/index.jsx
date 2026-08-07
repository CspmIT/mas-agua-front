import React, { useContext, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import style from '../utils/style.module.css'
import NavBarCustom from '../../NavBarCustom/views'
import { MainContext } from '../../../context/MainContext'
import Footer from '../components/Footer'
import { storage } from '../../../storage/storage'
import { getData, removeData } from '../../../storage/cookies-store'
import { isTokenExpired } from '../../../utils/js/session'
import LoaderComponent from '../../../components/Loader'
import NoAccess from '../../../components/NoAccess'

// Normaliza links de menú y rutas para compararlos: los links cargados en la
// base vienen con formatos mixtos ('viewDiagram/44', 'map?id=1', '/pumps/control')
const normalizeLink = (value) => decodeURI(String(value)).replace(/^\//, '').toLowerCase()

const matchesLink = (link, currentPath) => {
	const normalized = normalizeLink(link)
	return currentPath === normalized || currentPath.startsWith(`${normalized}/`)
}

const MainContent = () => {
	const { user, setUser, setClient, setInfoNav, permission, menus } = useContext(MainContext)
	const location = useLocation()
	const navigate = useNavigate()
	const authUser = storage.get('usuario')
	const validationUser = async () => {
		const token = await getData('token')
		// En Tauri el Store no borra el token vencido, por eso se valida tambien la expiracion
		if (!authUser || !token || isTokenExpired(token)) {
			localStorage.clear()
			await removeData('token')
			setUser(false)
			setClient(null)
			navigate('/login')
			return
		}
		if (!location.pathname.includes('/Abm/') && !location.pathname.includes('/AbmDevice/')) {
			setInfoNav('')
		}
	}

	const [loading, setLoading] = useState(false)
	useEffect(() => {
		validationUser()
	}, [location])

	// Guard por menú: si la ruta actual corresponde a un menú del tenant y el
	// usuario no lo tiene asignado, se muestra el cartel de sin acceso. Las
	// rutas que no figuran como menú (subpantallas, perfil, etc.) no se bloquean.
	const currentPath = normalizeLink(location.pathname + location.search)
	const isGated = menus.some((menu) => menu.link && matchesLink(menu.link, currentPath))
	const hasAccess = !isGated || permission.some((menu) => menu.link && matchesLink(menu.link, currentPath))
	return (
		<>
			<div className={`pt-[3.25rem] !min-h-screen absolute w-full bg-fixed bg-[linear-gradient(to_bottom,#e5e7eb_70%,#f9fafb_100%)] dark:bg-[linear-gradient(to_bottom,#374151_0%,#434f60_100%)]`}>
				<NavBarCustom setLoading={setLoading} />
				{!loading ? (
					<LoaderComponent />
				) : (
					<>
						<div className={`sm:pl-[4rem] pl-4 pr-4 sm:pr-2 pb-24 sm:pb-12 z-10 flex relative ${style.boxMain}`}>
							{hasAccess ? <Outlet /> : <NoAccess />}
						</div>
						<Footer />
					</>
				)}
			</div>
		</>
	)
}

export default MainContent
