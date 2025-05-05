import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import {
	ListItemText,
	ListItemIcon,
	ListItemButton,
	ListItem,
	IconButton,
	Divider,
	Typography,
	List,
	Toolbar,
	useMediaQuery,
	Badge,
} from '@mui/material'
import DropdownImage from '../../core/components/DropdownImage'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import ButtonModeDark from '../../core/components/ButtonModeDark'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppBarCustom from '../components/AppBarCustom'
import DrawerCustom from '../components/DrawerCustom'
import DrawerHeaderCustom from '../components/DrawerHeaderCustom'
import SubMenuCustom from '../components/SubMenuCustom'
import { MainContext } from '../../../context/MainContext'
import BottonApps from '../../LoginApp/components/BottonApps/BottonApps'
import { storage } from '../../../storage/storage'
import { getPermissionDb } from '../utils/js'
import { PiTabsFill } from 'react-icons/pi'
import ListIcon from '../../../components/ListIcon'
import { front } from '../../../utils/routes/app.routes'
import styles from '../utils/css/styles.module.css'
import { io } from 'socket.io-client'
import Cookies from 'js-cookie'
import Logo from '/src/assets/img/Logo/LogoTextAgua.png'
import { list_menu } from '../../ConfigMenu/components/PermissionMenu/components/data'
function NavBarCustom({ setLoading }) {
	const [open, setOpen] = useState(false)
	const [nameCoop, setNameCoop] = useState('')
	const { tabActive, tabs, infoNav, permission, setPermission } = useContext(MainContext)
	const navigate = useNavigate()
	const NavBarRef = useRef(null)
	const { pathname } = useLocation()
	const locationTAbs = pathname.split('/')[1] || '/DashBoard'
	const location = pathname
	const [buttonActive, setButtonActive] = useState(location)
	const isMobile = useMediaQuery('(max-width: 600px)')
	const handleDrawerOpen = () => {
		setOpen(true)
	}
	const handleDrawerClose = () => {
		setOpen(false)
	}
    
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (NavBarRef.current && !NavBarRef.current.contains(event.target)) {
				handleDrawerClose()
			}
		}
		document.addEventListener('mouseup', handleClickOutside)
		return () => {
			document.removeEventListener('mouseup', handleClickOutside)
		}
	}, [])
	const [newEvent, setNewEvent] = useState(false)

	// useEffect(() => {
	// 	const socket = io(front['Mas Agua'], { path: '/api/socket.io', query: { token: Cookies.get('token') } })

	// 	socket.on('alert-active', (data) => {
	// 		setNewEvent(data.active)
	// 	})
	// 	return () => socket.disconnect()
	// }, [])

	useEffect(() => {
		setButtonActive(location)
		if (location === '/DashBoard') {
			setButtonActive('/home')
		}
		if (infoNav != '') {
			setButtonActive(typeof infoNav == 'object' ? infoNav[0].link : infoNav)
		}
		if (location === '/' || location === '/Home' || location === '') {
			setButtonActive('/home')
		}
		if ((locationTAbs.includes('Abm') || locationTAbs.includes('AbmDevice')) && infoNav == '') {
			navigate('/Home')
		}
	}, [location, locationTAbs])

	const activeButton = useCallback(
		(id) => {
			navigate(id)
		},
		[navigate]
	)
	const [menuSideBar, setMenuSideBar] = useState([])
	const groupedMenu = async (data) => {
		const result = data.reduce((acc, menu) => {
			const groupMenuId = parseInt(menu.group_menu)
			if (!acc[groupMenuId]) {
				acc[groupMenuId] = { ...menu, subMenus: [] }
			}
			if (menu.sub_menu) {
				const parentMenu = acc[groupMenuId]
				const subMenu = { ...menu, subMenus: [] }
				const findAndAddSubMenu = (parent, sub) => {
					if (parent.id === sub.sub_menu) {
						parent.subMenus.push(sub)
					} else {
						for (let i = 0; i < parent.subMenus.length; i++) {
							findAndAddSubMenu(parent.subMenus[i], sub)
						}
					}
				}
				findAndAddSubMenu(parentMenu, subMenu)
			}
			return acc
		}, [])
		result.sort((a, b) => a.order - b.order)
		setMenuSideBar(result.filter((item) => Object.values(item).length))
	}

	const getPermissions = async () => {
		const permiso = import.meta.env.VITE_WIFI == 'sin' ? list_menu : await getPermissionDb()
		setPermission(permiso)
		await groupedMenu(permiso)
		setLoading(true)
	}

	useEffect(() => {
		if (storage.get('usuarioCooptech')) {
			const cliente = Array.isArray(storage.get('usuarioCooptech')?.client)
				? storage.get('usuarioCooptech')?.cliente?.filter((item) => item.selected)[0]
				: storage.get('usuarioCooptech')?.cliente || ''
			setNameCoop(cliente.name)
			getPermissions()
		}
	}, [])

	return (
		<>
			<AppBarCustom className='!max-h-11 flex justify-center' position='fixed' open={open}>
				<Toolbar className='!pl-[1.1rem]'>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						onClick={handleDrawerOpen}
						edge='start'
						size='small'
						sx={{
							marginRight: 4,
							boxShadow: 'none',
							...(isMobile && { display: 'none' }),
							...(open && { display: 'none' }),
						}}
					>
						<MenuIcon />
					</IconButton>

					<img onClick={() => navigate('home')} className=' max-h-7 cursor-pointer' src={Logo} />
					{/* <Typography variant='h6' noWrap component='div'>
						Reconecta
					</Typography> */}
					<div className='absolute right-5 flex flex-row items-center gap-2'>
						<p className={`text-black text-base ml-3 select-none ${isMobile ? 'hidden' : ''}`}>
							{nameCoop}
						</p>
						<BottonApps />
						<ButtonModeDark />
						<DropdownImage />
					</div>
				</Toolbar>
			</AppBarCustom>
			<DrawerCustom
				variant='permanent'
				open={open}
				ref={NavBarRef}
				sx={{
					...(isMobile && {
						position: 'fixed',
						bottom: 0,
						width: '100%',
						height: '10vh',
						zIndex: 1200,
						'& .MuiDrawer-paper': {
							position: 'absolute',
							bottom: 0,
							width: '100%',
							height: '10vh',
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-around',
							padding: '0',
						},
					}),
				}}
			>
				<div className='bg-white dark:bg-gray-800 h-full w-full sm:w-auto'>
					<DrawerHeaderCustom className='!min-h-11 !h-11' style={{ display: isMobile ? 'none' : '' }}>
						<IconButton onClick={handleDrawerClose}>
							<ChevronLeftIcon className='dark:text-white' />
						</IconButton>
					</DrawerHeaderCustom>
					<Divider />

					<List
						sx={{
							...(isMobile && {
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'center',
								width: '100%',
								padding: 0,
							}),
						}}
					>
						{menuSideBar.map((item, index) => {
							if (item.name.includes('ABM') && (item.link == '' || infoNav == '')) {
								return null
							}
							if (!permission.some((perm) => perm.name == item.name)) {
								return null
							}
							const listIcon = ListIcon()
							const componentIcon = listIcon.filter((icono) => icono.name === item.icon)?.[0] || ''

							return (
								<ListItem
									key={index}
									disablePadding
									sx={{
										...(isMobile && {
											flexGrow: 1,
											flexBasis: 0,
											// justifyContent: 'center',
											// display: 'flex',
										}),
									}}
								>
									{item.subMenus.length ? (
										<SubMenuCustom
											item={item}
											className={`dark:text-white`}
											openSideBar={open}
											buttonActive={buttonActive}
											activeButton={activeButton}
										/>
									) : (
										<Link to={item.link} className={`!w-full text-black dark:text-white`}>
											<ListItemButton
												sx={{
													minHeight: 48,
													justifyContent: !isMobile && open ? 'initial' : 'center',
													padding: !isMobile ? '1.25rem' : '0.2rem',
													py: 1.8,
												}}
												className={`!w-full ${
													item.link === '/Alert' && newEvent ? styles.backgroundAlert : ''
												}`}
												onClick={() => activeButton(item.link)}
											>
												<ListItemIcon
													className={`${!isMobile && open ? '!mr-3' : ''}`}
													sx={{
														minWidth: 0,
														mr: !isMobile && open ? 3 : 'auto',
														justifyContent: 'center',
														color: buttonActive?.includes(item.link) ? 'blue' : '',
														marginRight: !isMobile ? 'auto' : '0',
													}}
												>
													{componentIcon.icon}
												</ListItemIcon>
												<ListItemText
													primary={item.name}
													sx={{
														opacity: !isMobile && open ? 1 : 0,
														color: buttonActive?.includes(item.link) ? 'blue' : '',
														display: isMobile ? 'none !important' : 'block',
													}}
												/>
											</ListItemButton>
										</Link>
									)}
								</ListItem>
							)
						})}
						{tabs.length == 0 && !locationTAbs.includes('tabs') ? null : (
							<ListItem
								key={'tabs'}
								disablePadding
								sx={{
									...(isMobile && {
										flexGrow: 1,
										flexBasis: 0,
										justifyContent: 'center',
										display: 'flex',
									}),
								}}
							>
								<Link to={'/tabs'} className={` text-black dark:text-white`}>
									<ListItemButton
										sx={{
											minHeight: 48,
											justifyContent: !isMobile && open ? 'initial' : 'center',
											px: 2.5,
											py: 1.8,
										}}
										className='!w-full'
										onClick={() => activeButton('/tabs')}
									>
										<ListItemIcon
											sx={{
												minWidth: 0,
												mr: !isMobile && open ? 3 : 'auto',
												justifyContent: 'center',
												color: buttonActive == '/tabs' ? 'blue' : '',
											}}
										>
											<Badge badgeContent={tabActive} color='primary'>
												<PiTabsFill className='dark:text-white text-3xl' />
											</Badge>
										</ListItemIcon>
										<ListItemText
											primary={'Paginas'}
											sx={{
												opacity: !isMobile && open ? 1 : 0,
												color: buttonActive == '/tabs' ? 'blue' : '',
												display: isMobile ? 'none !important' : 'block',
											}}
										/>
									</ListItemButton>
								</Link>
							</ListItem>
						)}
					</List>
				</div>
			</DrawerCustom>
		</>
	)
}

export default NavBarCustom
