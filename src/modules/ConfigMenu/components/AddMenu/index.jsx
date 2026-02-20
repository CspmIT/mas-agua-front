import { Fragment, useEffect, useMemo, useState } from 'react'
import {
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Paper, IconButton,
	Tooltip, Button, Typography, Container,
	Chip, Stack
} from '@mui/material'
import { Add, Delete, Edit, Security } from '@mui/icons-material'
import CardCustom from '../../../../components/CardCustom'
import Swal from 'sweetalert2'
import { backend } from '../../../../utils/routes/app.routes'
import { request } from '../../../../utils/js/request'
import ListIcon from '../../../../components/ListIcon'
import MenuDialog from './components/MenuDialog'
import LoaderComponent from '../../../../components/Loader'

function AddMenu() {
	const [menus, setMenus] = useState([])
	const [profiles, setProfiles] = useState([])
	const [permissionsMap, setPermissionsMap] = useState({})
	const [loadingApp, setLoadingApp] = useState(true)

	const [openDialog, setOpenDialog] = useState(false)
	const [dialogMode, setDialogMode] = useState('create')
	const [selectedMenu, setSelectedMenu] = useState(null)
	const [parentMenu, setParentMenu] = useState(null)

	const iconMap = useMemo(() => {
		return ListIcon().reduce((acc, i) => {
			acc[i.name] = i.icon
			return acc
		}, {})
	}, [])

	const renderIcon = (name) =>
		iconMap[name] || <span style={{ opacity: 0.3 }}>—</span>

	const loadData = async () => {
		try {
			setLoadingApp(true)

			const profilesRes = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/listProfiles`,
				'GET'
			)
			setProfiles(profilesRes.data)

			const menuRes = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/getAllMenu`,
				'GET'
			)

			const ordered = [...menuRes.data].sort((a, b) => a.order - b.order)
			setMenus(ordered)

			const map = {}

			for (let i = 0; i < ordered.length; i++) {
				const m = ordered[i]
				try {
					const res = await request(
						`${backend[import.meta.env.VITE_APP_NAME]}/getPermissionByMenu?id_menu=${m.id}`,
						'GET'
					)
					map[m.id] = res.data?.data || []
				} catch {
					map[m.id] = []
				}
			}

			setPermissionsMap(map)

		} catch (e) {
			console.error('Error inicializando AddMenu', e)
			Swal.fire('Error', 'No se pudo cargar la información', 'error')
		} finally {
			setLoadingApp(false)
		}
	}

	useEffect(() => {
		loadData()
	}, [])

	// ---------------- ACTIONS ----------------
	const openCreateMenu = () => {
		setDialogMode('create')
		setSelectedMenu(null)
		setParentMenu(null)
		setOpenDialog(true)
	}

	const openCreateSubMenu = (menu) => {
		setDialogMode('create')
		setSelectedMenu(null)
		setParentMenu(menu)
		setOpenDialog(true)
	}

	const openEditMenu = (menu) => {
		setDialogMode('edit')
		setSelectedMenu(menu)
		setParentMenu(null)
		setOpenDialog(true)
	}

	const openEditSubMenu = (menu) => {
		setDialogMode('edit')
		setSelectedMenu(menu)
		setParentMenu(menu)
		setOpenDialog(true)
	}

	const deleteSubMenu = async (menu) => {
		const { value: ok } = await Swal.fire({
			title: 'Atención!',
			text: `¿Deseas eliminar "${menu.name}" y sus submenús?`,
			icon: 'question',
			showDenyButton: true,
			confirmButtonText: 'Sí',
			denyButtonText: 'No',
		})

		if (!ok) return

		const deleteData = menus
			.filter((item) => isDescendant(menu, item, menus))
			.map((item) => ({ ...item, status: 0 }))

		Swal.fire({ title: 'Eliminando...', allowOutsideClick: false, didOpen: Swal.showLoading })

		await request(
			`${backend[import.meta.env.VITE_APP_NAME]}/deleteMenu`,
			'POST',
			deleteData
		)

		Swal.fire('OK', 'Menú eliminado', 'success')
		loadData()
	}

	// ---------------- PERMISSIONS ----------------
	const managePermissions = async (menu) => {
		const res = await request(
			`${backend[import.meta.env.VITE_APP_NAME]}/getPermissionByMenu?id_menu=${menu.id}`,
			'GET'
		)

		const activeProfiles = res.data?.data || []
		let selected = []

		const { value: roles } = await Swal.fire({
			title: `Permisos: ${menu.name}`,
			html: profiles.map(p => `
				<label style="display:flex;gap:10px;margin:6px 0;">
					<input type="checkbox" value="${p.id}" ${activeProfiles.includes(p.id) ? 'checked' : ''}/>
					${p.description}
				</label>
			`).join(''),
			preConfirm: () => {
				const inputs = Swal.getPopup().querySelectorAll('input[type="checkbox"]')
				selected = [...inputs].filter(i => i.checked).map(i => +i.value)
				return selected
			},
			showCancelButton: true,
			confirmButtonText: 'Guardar'
		})

		if (!roles) return

		await request(
			`${backend[import.meta.env.VITE_APP_NAME]}/postPermissionByMenu`,
			'POST',
			{ id_menu: menu.id, profiles: roles }
		)

		setPermissionsMap(prev => ({ ...prev, [menu.id]: roles }))
		Swal.fire('OK', 'Permisos actualizados', 'success')
	}

	// ---------------- TREE ----------------
	const buildMenuTree = (data) => {
		const map = {}
		const roots = []

		data.forEach(i => map[i.id] = { ...i, children: [] })
		data.forEach(i => i.sub_menu ? map[i.sub_menu]?.children.push(map[i.id]) : roots.push(map[i.id]))

		const sort = (n) => { n.sort((a, b) => a.order - b.order); n.forEach(x => sort(x.children)) }
		sort(roots)

		return roots
	}

	const renderPermissions = (menuId) => {
		const ids = permissionsMap[menuId] || []
		if (!ids.length) return <Chip size="small" label="Sin permisos" variant="outlined" />

		const names = profiles.filter(p => ids.includes(p.id)).map(p => p.description)

		return (
			<Tooltip title={names.join(', ')} arrow>
				<Stack direction="row" spacing={0.5}>
					{names.slice(0, 2).map(n => <Chip key={n} size="small" label={n} />)}
					{names.length > 2 && <Chip size="small" label={`+${names.length - 2}`} />}
				</Stack>
			</Tooltip>
		)
	}

	if (loadingApp) {
		return (
			<Container className="w-full flex justify-center items-center min-h-[60vh]">
				<LoaderComponent />
			</Container>
		)
	}

	return (
		<Container className='w-full'>
			{/* HEADER */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
				<Typography className="w-full text-center md:!ms-40" variant="h4">Menús</Typography>
				<Button variant="contained" className="sm:mx-10 whitespace-nowrap !px-5" onClick={openCreateMenu}>Nuevo Menú</Button>
			</div>

			<CardCustom className='w-full p-3 rounded-xl'>
				<TableContainer component={Paper}>
					<Table size='small'>
						<TableHead className='bg-slate-200'>
							<TableRow>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
								<TableCell>Nombre</TableCell>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Link</TableCell>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Permisos</TableCell>
								<TableCell align='right'>Acciones</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{buildMenuTree(menus).map(menu => (
								<Fragment key={menu.id}>
									<TableRow>
										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
											{renderIcon(menu.icon)}
										</TableCell>

										<TableCell>
											<strong>{menu.name}</strong>
											<Tooltip title='Agregar Submenú' placement='right' arrow>
												<IconButton size='small' className='!bg-primary rounded-xl !m-2' onClick={() => openCreateSubMenu(menu)}>
													<Add fontSize='small' className='text-white'/>
												</IconButton>
											</Tooltip>
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
											{menu.link}
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{renderPermissions(menu.id)}</TableCell>

										<TableCell align='right'>
											<IconButton onClick={() => openEditMenu(menu)} color='warning'><Edit /></IconButton>
											<IconButton onClick={() => deleteSubMenu(menu)} color='error'><Delete /></IconButton>
											<IconButton onClick={() => managePermissions(menu)} color='primary'><Security /></IconButton>
										</TableCell>
									</TableRow>

									{menu.children.map(sub => (
										<TableRow key={sub.id} sx={{ background: '#f5f5f5' }}>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
												{renderIcon(sub.icon)}
											</TableCell>

											<TableCell style={{ paddingLeft: 40 }}>↳ {sub.name}</TableCell>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{sub.link}</TableCell>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{renderPermissions(sub.id)}</TableCell>

											<TableCell align='right'>
												<IconButton onClick={() => openEditSubMenu(sub)} color='warning'><Edit /></IconButton>
												<IconButton onClick={() => deleteSubMenu(sub)} color='error'><Delete /></IconButton>
												<IconButton onClick={() => managePermissions(sub)} color='primary'><Security /></IconButton>
											</TableCell>
										</TableRow>
									))}
								</Fragment>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</CardCustom>

			<MenuDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				menu={selectedMenu}
				parentMenu={parentMenu}
				profiles={profiles}
				mode={dialogMode}
				onSaved={loadData}
			/>
		</Container>
	)
}

// ---------------- HELPERS ----------------
const isDescendant = (menu, item, all) => {
	if (item.id === menu.id) return true
	let current = item
	while (current.sub_menu !== null) {
		if (current.sub_menu === menu.id) return true
		current = all.find(m => m.id === current.sub_menu)
	}
	return false
}

export default AddMenu
