import { useContext, useEffect, useState } from 'react'
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Checkbox,
	Typography,
	List,
	Button,
	ListItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuItems from './components/MenuItems'
import Swal from 'sweetalert2'
import { request } from '../../../../utils/js/request'
import { backend } from '../../../../utils/routes/app.routes'
import { MainContext } from '../../../../context/MainContext'
import { getPermissionDb } from '../../../NavBarCustom/utils/js'
import { list_menu, permisos } from './components/data'

const PermissionMenu = ({ data, id_user, profile }) => {
	const { setPermission } = useContext(MainContext)
	const [selectedMenus, setSelectedMenus] = useState({})
	const [permissonUserData, setPermissonUserData] = useState([])
	const [permissonProfileData, setPermissonProfileData] = useState([])
	const [expandedAccordions, setExpandedAccordions] = useState({})
	const [groupedMenus, setGroupedMenus] = useState({})
	const handleCheckboxChange = (id, subMenus, type_select) => {
		const updateSelection = (menus, isSelected) => {
			return menus.reduce((acc, menu) => {
				acc[menu.id] = { status: isSelected, id: menu.id, type_select }
				if (menu.subMenus) {
					Object.assign(acc, updateSelection(menu.subMenus, isSelected))
				}
				return acc
			}, {})
		}
		setSelectedMenus((prevSelectedMenus) => {
			const isSelected = !prevSelectedMenus[id]?.status || 0
			const updatedSelection = updateSelection(subMenus, isSelected)
			return {
				...prevSelectedMenus,
				[id]: { status: isSelected, id: id, type_select },
				...updatedSelection,
			}
		})
	}

	const handleAccordionChange = (id) => (event, isExpanded) => {
		setExpandedAccordions((prevExpandedAccordions) => ({
			...prevExpandedAccordions,
			[id]: isExpanded,
		}))
	}

	const calculateCheckboxState = (menu) => {
		const haveSubMenu = menu.subMenus && menu.subMenus.length > 0
		let statusChildren = false
		if (haveSubMenu) {
			const resultado2 = menu.subMenus.map((subMenu) => calculateCheckboxState(subMenu))
			statusChildren =
				resultado2.filter((checkboxState) => checkboxState.checked || checkboxState.indeterminate).length > 0
		}
		if (!menu.subMenus || menu.subMenus?.length < 1) {
			return {
				checked: selectedMenus[menu.id]?.status || false,
				indeterminate: false,
			}
		}
		const subMenusSelected = menu.subMenus.map((sub) => selectedMenus[sub.id]?.status || false)
		const allSelected = subMenusSelected.every(Boolean)
		const noneSelected = subMenusSelected.every((selected) => !selected)
		if (allSelected) {
			statusChildren = false
		}
		return {
			checked: allSelected,
			indeterminate: (!allSelected && !noneSelected) || statusChildren,
		}
	}

	const getDataMenu = async () => {
		const menus =
			import.meta.env.VITE_WIFI == 'sin'
				? { data: list_menu }
				: await request(`${backend[`${import.meta.env.VITE_APP_NAME}`]}/getAllMenu`, 'GET')

		const menusByOrder = menus.data.sort((a, b) => a.order - b.order)
		setGroupedMenus(await groupedMenu(menusByOrder))
	}
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
		}, {})
		const resultByOrder = Object.values(result).sort((a, b) => a.order - b.order)
		return resultByOrder
	}

	const desestructurarMenus = (menus) => {
		return menus.reduce((acc, menu) => {
			const currentMenu = { id: menu.id, status: false }
			acc.push(currentMenu)
			if (menu.subMenus && menu.subMenus.length > 0) {
				const subMenusFlattened = desestructurarMenus(menu.subMenus)
				acc = acc.concat(subMenusFlattened)
			}

			return acc
		}, [])
	}
	const getPermission = async () => {
		const permission =
			import.meta.env.VITE_WIFI == 'sin'
				? permisos
				: await request(
						`${backend[`${import.meta.env.VITE_APP_NAME}`]}/getPermission?id=${
							id_user ? id_user : profile
						}&type=${id_user ? 'id_user' : 'id_profile'}&profile=${id_user ? data.profile : profile}`,
						'GET'
				  )
		const userPermission = permission.data.filter((item) => item.id_user)
		const profilePermission = permission.data.filter((item) => item.id_profile)
		setPermissonUserData(userPermission)
		setPermissonProfileData(profilePermission)
		if (permission.data.length) {
			const allMenus = desestructurarMenus(Object.values(groupedMenus))
			const menuPermissions = {}
			allMenus.forEach((item) => {
				const permItemUser = userPermission.find((prem) => prem.id_menu == item.id && prem.status) || {}
				const permItemProfile = profilePermission.find((prem) => prem.id_menu == item.id && prem.status) || {}
				menuPermissions[item.id] = {
					status: permItemProfile?.status ? true : permItemUser?.status ? true : false,
					type_select: permItemProfile?.status ? 'profile' : permItemUser?.status ? 'user_id' : false,
					id: item.id,
				}
			})

			setSelectedMenus(menuPermissions)
		}
	}

	// Cargar los datos al inicializar el componente
	useEffect(() => {
		getDataMenu()
	}, [])
	useEffect(() => {
		if (Object.values(groupedMenus).length) {
			getPermission()
		}
	}, [groupedMenus])

	const SaveMenu = async () => {
		try {
			const allMenus = desestructurarMenus(Object.values(groupedMenus))
			const result = allMenus.map((item) => {
				const arrayUpdate = id_user ? permissonUserData : permissonProfileData
				const permissionItem = arrayUpdate.find((prem) => prem.id_menu == item.id) || { id: 0 }
				return {
					id: permissionItem.id || 0,
					id_menu: item.id,
					status:
						id_user && selectedMenus[item.id].type_select == 'user_id'
							? selectedMenus[item.id].status
							: id_user && selectedMenus[item.id].type_select == 'profile'
							? false
							: selectedMenus?.[item.id]?.status || false,
					id_profile: profile || null,
					id_user: id_user || null,
				}
			})
			await request(backend['Mas Agua'] + '/savePermission', 'POST', result)
			setPermission(await getPermissionDb())
			Swal.fire({
				title: 'Perfecto!',
				text: 'Se guardó correctamente',
				icon: 'success',
			})
		} catch (error) {
			console.error('Error al guardar el menú:', error)
			Swal.fire({
				title: 'Atención!',
				text: 'Hubo un error en el guardado',
				icon: 'warning',
			})
		}
	}
	return (
		<div className='w-full'>
			<div className='w-full flex justify-end  p-2'>
				<Button onClick={SaveMenu} variant='contained'>
					Guardar
				</Button>
			</div>
			<div className='w-full'>
				{Object.values(groupedMenus).map((groupMenu) => {
					const number = 240 - parseInt(groupMenu.level) * 10
					const isExpanded = expandedAccordions[groupMenu.id] || false

					const { checked, indeterminate } = calculateCheckboxState(groupMenu)
					return groupMenu.subMenus.length > 0 ? (
						<Accordion
							key={groupMenu.id}
							expanded={isExpanded}
							onChange={handleAccordionChange(groupMenu.id)}
							sx={{ backgroundColor: `rgb(${number},${number},${number})` }}
							className='!shadow-none border-2 border-solid border-white'
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								sx={{ flexDirection: 'row-reverse' }}
								aria-controls={`panel${groupMenu.id}-content`}
								id={`panel${groupMenu.id}-header`}
							>
								<Checkbox
									checked={Boolean(checked)}
									indeterminate={indeterminate}
									disabled={
										profile
											? false
											: permissonProfileData.some(
													(perm) =>
														Boolean(perm.id_profile) &&
														Boolean(perm.status) &&
														perm.id_menu == groupMenu.id
											  )
									}
									onClick={(event) => {
										event.stopPropagation()
										handleCheckboxChange(groupMenu.id, groupMenu.subMenus)
									}}
								/>
								<Typography className='flex items-center'>{groupMenu.name}</Typography>
							</AccordionSummary>
							<AccordionDetails
								className={`!pl-14 ${
									isExpanded ? 'border-0 border-t-2 border-solid border-white' : ''
								}`}
							>
								<List>
									<MenuItems
										items={groupMenu.subMenus}
										expandedAccordions={expandedAccordions}
										handleAccordionChange={handleAccordionChange}
										selectedMenus={selectedMenus}
										permissonProfileData={profile ? [] : permissonProfileData}
										permissonUserData={profile ? [] : permissonUserData}
										handleCheckboxChange={handleCheckboxChange}
										calculateCheckboxState={calculateCheckboxState}
									/>
								</List>
							</AccordionDetails>
						</Accordion>
					) : (
						<ListItem className='flex !items-center !w-full !pl-10' key={groupMenu.id}>
							<Checkbox
								checked={Boolean(checked)}
								indeterminate={indeterminate}
								disabled={
									profile
										? false
										: permissonProfileData.some(
												(perm) =>
													Boolean(perm.id_profile) &&
													Boolean(perm.status) &&
													perm.id_menu == groupMenu.id
										  )
								}
								onClick={(event) => {
									event.stopPropagation()
									let type_select = id_user ? 'user_id' : 'profile'
									handleCheckboxChange(groupMenu.id, groupMenu.subMenus, type_select)
								}}
							/>
							<Typography className='flex items-center text-black'>{groupMenu.name}</Typography>
						</ListItem>
					)
				})}
			</div>
		</div>
	)
}

export default PermissionMenu
