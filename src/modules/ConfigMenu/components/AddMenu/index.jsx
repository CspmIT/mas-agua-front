import { Fragment, useEffect, useMemo, useState } from 'react'
import {
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, IconButton,
	Tooltip, Container,
	Chip, Stack, Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem
} from '@mui/material'
import { Add, Delete, Edit, Security } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { backend } from '../../../../utils/routes/app.routes'
import { request } from '../../../../utils/js/request'
import ListIcon from '../../../../components/ListIcon'
import MenuDialog from './components/MenuDialog'
import LoaderComponent from '../../../../components/Loader'
import PageHeader from '../../../../components/PageHeader'
import FiltersBar from '../../../../components/FiltersBar'

const actionIconSx = (lightColor, darkColor) => ({
	color: lightColor,
	width: 32,
	height: 32,
	borderRadius: '10px',
	transition: 'background-color 0.15s ease, transform 0.15s ease',
	'&:hover': {
		backgroundColor: `${lightColor}1f`,
		transform: 'translateY(-1px)',
	},
	'body.dark &': {
		color: darkColor,
		'&:hover': { backgroundColor: `${darkColor}29` },
	},
})

const tableShellSx = {
	borderRadius: '14px',
	border: '1px solid rgba(15, 42, 68, 0.08)',
	boxShadow: '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
	overflow: 'hidden',
	backgroundColor: '#ffffff',
	transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	opacity: 0,
	transform: 'translateY(8px)',
	animation: 'tableMountIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
	'@keyframes tableMountIn': {
		'0%': { opacity: 0, transform: 'translateY(8px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' },
	},
	'&:hover': {
		boxShadow: '0 4px 10px rgba(15, 42, 68, 0.06), 0 18px 40px -14px rgba(15, 42, 68, 0.18)',
	},
	'body.dark &': {
		backgroundColor: 'rgba(17, 24, 39, 0.85)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 12px 32px -12px rgba(0, 0, 0, 0.5)',
	},
	'body.dark &:hover': {
		boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3), 0 18px 40px -14px rgba(0, 0, 0, 0.55)',
	},
	'& th': {
		backgroundColor: '#2c6aa0',
		fontSize: '0.72rem',
		fontWeight: 700,
		letterSpacing: '0.06em',
		textTransform: 'uppercase',
		color: '#ffffff',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
	},
	'body.dark & th': {
		backgroundColor: '#1f4e79',
		color: '#ffffff',
		borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
	},
	'& td': {
		borderBottom: '1px solid rgba(15, 42, 68, 0.04)',
		color: '#1f2937',
		fontSize: '0.875rem',
	},
	'body.dark & td': {
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		color: '#e5e7eb',
	},
	'& tbody tr > td': { transition: 'background-color 0.18s ease' },
	'& tbody tr[data-parent="true"] td': { backgroundColor: '#ffffff' },
	'& tbody tr[data-parent="false"] td': { backgroundColor: '#f8fafc' },
	'body.dark & tbody tr[data-parent="true"] td': { backgroundColor: 'rgba(17, 24, 39, 0.6)' },
	'body.dark & tbody tr[data-parent="false"] td': { backgroundColor: 'rgba(31, 41, 55, 0.5)' },
	'& tbody tr:hover td': { backgroundColor: 'rgba(54, 139, 237, 0.08) !important' },
	'& tbody tr:hover td:first-of-type': { boxShadow: 'inset 3px 0 0 #2c6aa0' },
	'body.dark & tbody tr:hover td': { backgroundColor: 'rgba(94, 165, 240, 0.1) !important' },
	'body.dark & tbody tr:hover td:first-of-type': { boxShadow: 'inset 3px 0 0 #5ea5f0' },
}

function AddMenu() {
	const [menus, setMenus] = useState([])
	const [profiles, setProfiles] = useState([])
	const [permissionsMap, setPermissionsMap] = useState({})
	const [loadingApp, setLoadingApp] = useState(true)
	const [openDialog, setOpenDialog] = useState(false)
	const [dialogMode, setDialogMode] = useState('create')
	const [selectedMenu, setSelectedMenu] = useState(null)
	const [parentMenu, setParentMenu] = useState(null)
	const [permissionFilter, setPermissionFilter] = useState('all')

	const iconMap = useMemo(() => {
		return ListIcon().reduce((acc, i) => {
			acc[i.name] = i.icon
			return acc
		}, {})
	}, [])

	const renderIcon = (name) =>
		iconMap[name] || <span style={{ opacity: 0.3 }}>—</span>

	// ---------------- LOAD DATA ----------------
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

	// ---------------- FILTER TREE ----------------
	const filterTreeByPermission = (tree, permissionsMap, filter) => {
		if (filter === 'all') return tree

		const profileId = filter === 'none' ? null : Number(filter)

		const filterNode = (node) => {
			const perms = permissionsMap[node.id] || []

			const selfMatch =
				filter === 'none'
					? perms.length === 0
					: perms.includes(profileId)

			const filteredChildren = node.children
				?.map(filterNode)
				.filter(Boolean)

			if (selfMatch || (filteredChildren && filteredChildren.length)) {
				return { ...node, children: filteredChildren || [] }
			}

			return null
		}

		return tree.map(filterNode).filter(Boolean)
	}

	const renderPermissions = (menuId) => {
		const ids = permissionsMap[menuId] || []
		if (!ids.length)
			return (
				<Chip
					size='small'
					label='Sin permisos'
					variant='outlined'
					sx={{
						height: 22,
						fontSize: '0.72rem',
						borderColor: 'rgba(148, 163, 184, 0.6)',
						color: '#64748b',
						'body.dark &': { borderColor: 'rgba(255,255,255,0.12)', color: '#9ca3af' },
					}}
				/>
			)

		const names = profiles.filter(p => ids.includes(p.id)).map(p => p.description)

		const chipSx = {
			height: 22,
			fontSize: '0.72rem',
			fontWeight: 500,
			backgroundColor: 'rgba(54, 139, 237, 0.1)',
			color: '#1e3a8a',
			border: '1px solid rgba(54, 139, 237, 0.25)',
			'body.dark &': {
				backgroundColor: 'rgba(94, 165, 240, 0.14)',
				color: '#c7dafe',
				border: '1px solid rgba(94, 165, 240, 0.3)',
			},
		}

		return (
			<Tooltip title={names.join(', ')} arrow>
				<Stack direction='row' spacing={0.5}>
					{names.slice(0, 2).map(n => <Chip key={n} size='small' label={n} sx={chipSx} />)}
					{names.length > 2 && <Chip size='small' label={`+${names.length - 2}`} sx={chipSx} />}
				</Stack>
			</Tooltip>
		)
	}

	if (loadingApp) {
		return (
			<Container maxWidth={false} disableGutters className='w-full flex justify-center items-center min-h-[60vh]'>
				<LoaderComponent />
			</Container>
		)
	}

	const tree = buildMenuTree(menus)
	const filteredTree = filterTreeByPermission(tree, permissionsMap, permissionFilter)

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			<PageHeader
				title='Menús'
				createLabel='Nuevo menú'
				onCreate={openCreateMenu}
			/>

			<FiltersBar
				showFilter={false}
				showReset={permissionFilter !== 'all'}
				onReset={() => setPermissionFilter('all')}
			>
				<div className='flex-1 min-w-[220px]'>
					<FormControl fullWidth size='small'>
						<InputLabel id='permission_filter_label'>Permisos</InputLabel>
						<Select
							labelId='permission_filter_label'
							label='Permisos'
							value={permissionFilter}
							onChange={(e) => setPermissionFilter(e.target.value)}
						>
							<MenuItem value='all'>Todos los menús</MenuItem>
							<MenuItem value='none'>Sin permisos asignados</MenuItem>
							{profiles.map((p) => (
								<MenuItem key={p.id} value={String(p.id)}>
									{p.description}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
			</FiltersBar>

			<Box sx={tableShellSx}>
				<TableContainer>
					<Table size='small'>
						<TableHead>
							<TableRow>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 56 }} />
								<TableCell>Nombre</TableCell>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Link</TableCell>
								<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Permisos</TableCell>
								<TableCell align='right'>Acciones</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{filteredTree.map(menu => (
								<Fragment key={menu.id}>
									<TableRow data-parent='true'>
										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
											<Box sx={{ color: '#368bed', 'body.dark &': { color: '#5ea5f0' }, display: 'inline-flex' }}>
												{renderIcon(menu.icon)}
											</Box>
										</TableCell>

										<TableCell>
											<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
												<span className='font-semibold text-slate-900 dark:text-gray-100'>{menu.name}</span>
												<Tooltip title='Agregar submenú' placement='right' arrow>
													<IconButton
														size='small'
														onClick={() => openCreateSubMenu(menu)}
														sx={{
															width: 22,
															height: 22,
															color: '#368bed',
															backgroundColor: 'rgba(54, 139, 237, 0.1)',
															borderRadius: '7px',
															transition: 'all 0.15s ease',
															'&:hover': {
																backgroundColor: '#368bed',
																color: '#ffffff',
																transform: 'scale(1.08)',
															},
															'body.dark &': {
																color: '#5ea5f0',
																backgroundColor: 'rgba(94, 165, 240, 0.15)',
																'&:hover': { backgroundColor: '#5ea5f0', color: '#0f172a' },
															},
														}}
													>
														<Add sx={{ fontSize: 14 }} />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
											<span className='font-mono text-xs text-slate-500 dark:text-gray-400'>
												{menu.link || '—'}
											</span>
										</TableCell>

										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
											{renderPermissions(menu.id)}
										</TableCell>

										<TableCell align='right'>
											<Stack direction='row' spacing={0.5} justifyContent='flex-end'>
												<Tooltip title='Editar'>
													<IconButton size='small' onClick={() => openEditMenu(menu)} sx={actionIconSx('#b45309', '#fbbf24')}>
														<Edit sx={{ fontSize: 18 }} />
													</IconButton>
												</Tooltip>
												<Tooltip title='Eliminar'>
													<IconButton size='small' onClick={() => deleteSubMenu(menu)} sx={actionIconSx('#e11d48', '#fb7185')}>
														<Delete sx={{ fontSize: 18 }} />
													</IconButton>
												</Tooltip>
												<Tooltip title='Permisos'>
													<IconButton size='small' onClick={() => managePermissions(menu)} sx={actionIconSx('#368bed', '#5ea5f0')}>
														<Security sx={{ fontSize: 18 }} />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>

									{menu.children.map(sub => (
										<TableRow key={sub.id} data-parent='false'>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
												<Box sx={{ color: '#64748b', 'body.dark &': { color: '#9ca3af' }, display: 'inline-flex' }}>
													{renderIcon(sub.icon)}
												</Box>
											</TableCell>

											<TableCell>
												<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, pl: 4 }}>
													<Box
														sx={{
															width: 16,
															height: 1,
															backgroundColor: 'rgba(54, 139, 237, 0.4)',
															'body.dark &': { backgroundColor: 'rgba(94, 165, 240, 0.5)' },
														}}
													/>
													<span className='text-slate-700 dark:text-gray-300'>{sub.name}</span>
												</Box>
											</TableCell>

											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
												<span className='font-mono text-xs text-slate-500 dark:text-gray-400'>
													{sub.link || '—'}
												</span>
											</TableCell>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
												{renderPermissions(sub.id)}
											</TableCell>

											<TableCell align='right'>
												<Stack direction='row' spacing={0.5} justifyContent='flex-end'>
													<Tooltip title='Editar'>
														<IconButton size='small' onClick={() => openEditSubMenu(sub)} sx={actionIconSx('#b45309', '#fbbf24')}>
															<Edit sx={{ fontSize: 18 }} />
														</IconButton>
													</Tooltip>
													<Tooltip title='Eliminar'>
														<IconButton size='small' onClick={() => deleteSubMenu(sub)} sx={actionIconSx('#e11d48', '#fb7185')}>
															<Delete sx={{ fontSize: 18 }} />
														</IconButton>
													</Tooltip>
													<Tooltip title='Permisos'>
														<IconButton size='small' onClick={() => managePermissions(sub)} sx={actionIconSx('#368bed', '#5ea5f0')}>
															<Security sx={{ fontSize: 18 }} />
														</IconButton>
													</Tooltip>
												</Stack>
											</TableCell>
										</TableRow>
									))}
								</Fragment>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

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