import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	CircularProgress,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { request } from '../../../../../utils/js/request'
import { backend } from '../../../../../utils/routes/app.routes'
import Swal from 'sweetalert2'
import FormMenu from './FormMenu'
import ModalShell from '../../../../../components/ModalShell'

const initialFormState = {
	name: '',
	link: '',
	icon: '',
	group_menu: null,
	level: 1,
	sub_menu: null,
	status: 1,
}

const sectionBoxSx = {
	backgroundColor: 'transparent',
	border: '1px solid rgba(15, 42, 68, 0.06)',
	borderRadius: '10px',
	p: { xs: 1.25, sm: 1.5 },
	'body.dark &': {
		border: '1px solid rgba(255, 255, 255, 0.06)',
	},
}

const primarySaveSx = {
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	color: '#ffffff',
	textTransform: 'none',
	fontWeight: 600,
	px: 2.5,
	py: 0.75,
	borderRadius: '999px',
	boxShadow: '0 6px 14px -6px rgba(31, 78, 121, 0.55)',
	transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		transform: 'translateY(-1px)',
		boxShadow: '0 10px 22px -8px rgba(31, 78, 121, 0.65)',
		filter: 'brightness(1.03)',
	},
	'&:disabled': {
		background: 'linear-gradient(135deg, #6b8faf 0%, #547394 100%)',
		color: 'rgba(255, 255, 255, 0.8)',
	},
}

const secondarySx = {
	color: '#475569',
	textTransform: 'none',
	fontWeight: 500,
	px: 2,
	py: 0.75,
	borderRadius: '999px',
	'&:hover': { backgroundColor: 'rgba(15, 42, 68, 0.06)' },
	'body.dark &': {
		color: '#cbd5e1',
		'&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
	},
}

function SectionHeader({ eyebrow, title, hint }) {
	return (
		<div className='mb-1.5'>
			<div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c6aa0]/80 dark:text-[#5ea5f0]/90'>
				{eyebrow}
			</div>
			{title && (
				<div className='text-sm font-semibold text-slate-800 dark:text-gray-100 leading-tight'>
					{title}
				</div>
			)}
			{hint && <div className='text-[11px] text-slate-500 dark:text-gray-400'>{hint}</div>}
		</div>
	)
}

export default function MenuDialog({
	open,
	onClose,
	menu,
	parentMenu,
	profiles,
	mode = 'create',
	onSaved,
}) {
	const [form, setForm] = useState(initialFormState)
	const [selectedProfiles, setSelectedProfiles] = useState([])
	const [loading, setLoading] = useState(false)

	const titleMap = {
		menu: { edit: 'Editar menú', create: 'Nuevo menú' },
		submenu: { edit: 'Editar submenú', create: 'Nuevo submenú' },
	}
	const isSubmenu = parentMenu !== null
	const type = isSubmenu ? 'submenu' : 'menu'

	useEffect(() => {
		resetForm()

		if (mode === 'edit' && menu) {
			setForm(menu)
			loadPermissions(menu.id)
			return
		}

		if (mode === 'create' && parentMenu) {
			setForm({
				...initialFormState,
				group_menu: parentMenu.group_menu,
				level: parentMenu.level + 1,
				sub_menu: parentMenu.id,
				status: 1,
			})
			return
		}

		if (mode === 'create' && !parentMenu) {
			setForm({
				...initialFormState,
				level: 1,
				sub_menu: null,
				group_menu: null,
				status: 1,
			})
		}
	}, [open, mode, menu, parentMenu])

	const loadPermissions = async (id_menu) => {
		try {
			const res = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/getPermissionByMenu?id_menu=${id_menu}`,
				'GET'
			)
			setSelectedProfiles(res.data?.data || [])
		} catch (e) {
			console.error(e)
		}
	}

	const toggleProfile = (id) => {
		setSelectedProfiles((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
		)
	}

	const selectAllProfiles = () => setSelectedProfiles(profiles.map((p) => p.id))
	const clearProfiles = () => setSelectedProfiles([])

	const resetForm = () => {
		setForm(initialFormState)
		setSelectedProfiles([])
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const handleSave = async () => {
		if (!form.name) {
			Swal.fire('Faltan datos', 'El nombre es obligatorio', 'warning')
			return
		}

		try {
			setLoading(true)

			const res = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/saveMenu`,
				'POST',
				{ ...form, id: mode === 'edit' ? form.id : 0 }
			)

			if (!res || res.error) throw new Error(res?.message || 'Error al guardar menú')

			const menuSaved = res.data || form

			await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/postPermissionByMenu`,
				'POST',
				{ id_menu: menuSaved.id, profiles: selectedProfiles }
			)

			Swal.fire({
				icon: 'success',
				title: 'Éxito',
				text:
					mode === 'edit'
						? 'Menú actualizado correctamente'
						: 'Menú creado correctamente',
				timer: 1500,
				showConfirmButton: false,
			})

			resetForm()
			onSaved()
			onClose()
		} catch (error) {
			console.error(error)
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: error.message || 'Error al guardar el menú',
			})
		} finally {
			setLoading(false)
		}
	}

	const isEdit = mode === 'edit'
	const allSelected = profiles.length > 0 && selectedProfiles.length === profiles.length

	return (
		<ModalShell
			open={open}
			onClose={handleClose}
			eyebrow={titleMap[type][mode]}
			title={isSubmenu ? 'Configuración de submenú' : 'Configuración de menú'}
			subtitle='Define nombre, enlace, icono y perfiles con acceso'
			maxWidth='820px'
			footer={
				<>
					<Button onClick={handleClose} disabled={loading} sx={secondarySx}>
						Cancelar
					</Button>
					<Button
						onClick={handleSave}
						disabled={loading}
						startIcon={
							loading ? (
								<CircularProgress size={16} sx={{ color: 'inherit' }} />
							) : (
								<Save sx={{ fontSize: 18 }} />
							)
						}
						sx={primarySaveSx}
					>
						{loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
					</Button>
				</>
			}
		>
			<div className='flex flex-col gap-2'>
				{/* CONFIG MENÚ */}
				<Box sx={sectionBoxSx}>
					<SectionHeader
						eyebrow='Configuración'
						title={isSubmenu ? 'Datos del submenú' : 'Datos del menú'}
						hint='Link manual o seleccionable desde diagramas / mapas'
					/>
					<FormMenu value={form} onChange={setForm} />
				</Box>

				{/* PERMISOS */}
				<Box sx={sectionBoxSx}>
					<div className='flex items-start justify-between gap-2 mb-1.5 flex-wrap'>
						<SectionHeader
							eyebrow='Permisos'
							title='Perfiles con acceso'
							hint={
								selectedProfiles.length === 0
									? 'Sin perfiles asignados'
									: `${selectedProfiles.length} perfil${selectedProfiles.length > 1 ? 'es' : ''} seleccionado${selectedProfiles.length > 1 ? 's' : ''}`
							}
						/>
						<div className='flex gap-1'>
							<Button
								size='small'
								onClick={allSelected ? clearProfiles : selectAllProfiles}
								sx={{
									textTransform: 'none',
									fontSize: '0.72rem',
									fontWeight: 600,
									color: '#2c6aa0',
									px: 1.25,
									py: 0.3,
									borderRadius: '999px',
									'&:hover': { backgroundColor: 'rgba(54, 139, 237, 0.1)' },
									'body.dark &': {
										color: '#5ea5f0',
										'&:hover': { backgroundColor: 'rgba(94, 165, 240, 0.1)' },
									},
								}}
							>
								{allSelected ? 'Quitar todos' : 'Seleccionar todos'}
							</Button>
						</div>
					</div>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-0'>
						{profiles.map((p) => {
							const checked = selectedProfiles.includes(p.id)
							return (
								<FormControlLabel
									key={p.id}
									control={
										<Checkbox
											checked={checked}
											onChange={() => toggleProfile(p.id)}
											size='small'
											sx={{
												p: 0.5,
												color: 'rgba(54, 139, 237, 0.6)',
												'&.Mui-checked': { color: '#2c6aa0' },
												'body.dark &': {
													color: 'rgba(94, 165, 240, 0.5)',
													'&.Mui-checked': { color: '#5ea5f0' },
												},
											}}
										/>
									}
									label={
										<span
											className={`text-sm ${checked ? 'font-semibold text-slate-800 dark:text-gray-100' : 'text-slate-600 dark:text-gray-300'}`}
										>
											{p.description}
										</span>
									}
									sx={{ m: 0 }}
								/>
							)
						})}
					</div>
				</Box>
			</div>
		</ModalShell>
	)
}
