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
import { Add, Delete, DragIndicator, Edit, Security } from '@mui/icons-material'
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

function SortableRow({ id, disabled, parent, children }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })

	// Los listeners van en la fila completa: se puede arrastrar desde cualquier
	// parte. Los clicks en botones internos siguen funcionando porque el drag
	// recién se activa al superar la distancia del sensor (6px).
	return (
		<TableRow
			ref={setNodeRef}
			data-parent={parent ? 'true' : 'false'}
			{...(disabled ? {} : listeners)}
			style={{
				// transform en style inline: con sx, Emotion regenera una clase CSS
				// por frame de arrastre para cada fila y el drag se siente lento
				transform: CSS.Transform.toString(transform),
				transition,
				...(isDragging && { position: 'relative', zIndex: 2, opacity: 0.85 }),
			}}
			sx={{
				...(!disabled && { cursor: 'grab', '&:active': { cursor: 'grabbing' } }),
				...(isDragging && {
					'& td': { backgroundColor: 'rgba(54, 139, 237, 0.12) !important' },
				}),
			}}
		>
			{children({ attributes, listeners })}
		</TableRow>
	)
}

function DragHandle({ attributes, disabled }) {
	if (disabled) return null
	return (
		<Box
			component='span'
			{...attributes}
			sx={{
				display: 'inline-flex',
				cursor: 'grab',
				touchAction: 'none',
				color: '#94a3b8',
				'body.dark &': { color: '#6b7280' },
			}}
		>
			<DragIndicator sx={{ fontSize: 16 }} />
		</Box>
	)
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

			const permRes = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/getAllMenuPermissions`,
				'GET'
			)
			setPermissionsMap(permRes.data?.data || {})

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

	// ---------------- REORDER (drag & drop) ----------------
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
	)

	const dragEnabled = permissionFilter === 'all'

	const handleDragEnd = async ({ active, over }) => {
		if (!over || active.id === over.id) return

		const dragged = menus.find(m => m.id === active.id)
		const target = menus.find(m => m.id === over.id)
		if (!dragged || !target) return

		// Solo se reordena entre hermanos (mismo padre)
		if ((dragged.sub_menu || null) !== (target.sub_menu || null)) return

		const parentId = dragged.sub_menu || null
		const siblings = menus
			.filter(m => (m.sub_menu || null) === parentId)
			.sort((a, b) => a.order - b.order)

		const oldIndex = siblings.findIndex(m => m.id === dragged.id)
		const newIndex = siblings.findIndex(m => m.id === target.id)
		const orderedIds = arrayMove(siblings, oldIndex, newIndex).map(m => m.id)

		const reordered = renumberTree(menus, parentId, orderedIds)
		setMenus(reordered)

		try {
			await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/reorderMenu`,
				'POST',
				reordered.map(m => ({ id: m.id, order: m.order }))
			)
		} catch (e) {
			console.error('Error al reordenar menús', e)
			Swal.fire('Error', 'No se pudo guardar el nuevo orden', 'error')
			loadData()
		}
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
	const rowIds = filteredTree.flatMap(m => [m.id, ...m.children.map(c => c.id)])

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
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<TableContainer>
						<Table size='small'>
							<TableHead>
								<TableRow>
									<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 72 }} />
									<TableCell>Nombre</TableCell>
									<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Link</TableCell>
									<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Permisos</TableCell>
									<TableCell align='right'>Acciones</TableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								<SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
								{filteredTree.map(menu => (
								<Fragment key={menu.id}>
									<SortableRow id={menu.id} disabled={!dragEnabled} parent>
									{({ attributes, listeners }) => (
									<>
										<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
											<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
												<DragHandle attributes={attributes} disabled={!dragEnabled} />
												<Box sx={{ color: '#368bed', 'body.dark &': { color: '#5ea5f0' }, display: 'inline-flex' }}>
													{renderIcon(menu.icon)}
												</Box>
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
									</>
									)}
									</SortableRow>

									{menu.children.map(sub => (
										<SortableRow key={sub.id} id={sub.id} disabled={!dragEnabled}>
										{({ attributes, listeners }) => (
										<>
											<TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} align='center'>
												<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
													<DragHandle attributes={attributes} disabled={!dragEnabled} />
													<Box sx={{ color: '#64748b', 'body.dark &': { color: '#9ca3af' }, display: 'inline-flex' }}>
														{renderIcon(sub.icon)}
													</Box>
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
										</>
										)}
										</SortableRow>
									))}
								</Fragment>
							))}
								</SortableContext>
						</TableBody>
					</Table>
				</TableContainer>
				</DndContext>
			</Box>

			<MenuDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				menu={selectedMenu}
				parentMenu={parentMenu}
				profiles={profiles}
				menus={menus}
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
	while (current && current.sub_menu) {
		if (current.sub_menu === menu.id) return true
		current = all.find(m => m.id === current.sub_menu)
	}
	return false
}

// Renumera todo el árbol en orden DFS (cada padre antes que sus hijos),
// aplicando a los hermanos de parentId el orden indicado en orderedIds.
// Mantener padres antes que hijos en el orden global es requisito del
// armado del menú en la NavBar (groupedMenu).
const renumberTree = (all, parentId, orderedIds) => {
	const childrenOf = (pid) => {
		const kids = all.filter(m => (m.sub_menu || null) === pid)
		if (pid === parentId) {
			return orderedIds.map(id => kids.find(k => k.id === id)).filter(Boolean)
		}
		return kids.sort((a, b) => a.order - b.order)
	}

	let counter = 0
	const result = []
	const walk = (pid) => {
		childrenOf(pid).forEach(m => {
			counter += 1
			result.push({ ...m, order: counter })
			walk(m.id)
		})
	}
	walk(null)
	return result
}

export default AddMenu