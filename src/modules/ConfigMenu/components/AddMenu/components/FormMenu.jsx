import { useState } from 'react'
import {
	MenuItem,
	TextField,
	Button,
	List,
	ListItemButton,
	ListItemText,
	CircularProgress,
	Box,
} from '@mui/material'
import { AccountTree, Map as MapIcon } from '@mui/icons-material'
import ListIcon from '../../../../../components/ListIcon'
import { request } from '../../../../../utils/js/request'
import { backend } from '../../../../../utils/routes/app.routes'
import ModalShell from '../../../../../components/ModalShell'
import '../utils/css/styles.css'

const pickerBtnSx = {
	textTransform: 'none',
	fontWeight: 600,
	fontSize: '0.78rem',
	px: 1.75,
	py: 0.5,
	borderRadius: '999px',
	borderColor: 'rgba(54, 139, 237, 0.35)',
	color: '#2c6aa0',
	backgroundColor: 'rgba(54, 139, 237, 0.04)',
	transition: 'all 0.18s ease',
	'&:hover': {
		borderColor: '#2c6aa0',
		backgroundColor: 'rgba(54, 139, 237, 0.1)',
		transform: 'translateY(-1px)',
	},
	'body.dark &': {
		borderColor: 'rgba(94, 165, 240, 0.35)',
		color: '#5ea5f0',
		backgroundColor: 'rgba(94, 165, 240, 0.06)',
		'&:hover': {
			borderColor: '#5ea5f0',
			backgroundColor: 'rgba(94, 165, 240, 0.12)',
		},
	},
}

function FormMenu({ value, onChange }) {
	const icons = ListIcon()

	const [maps, setMaps] = useState([])
	const [diagrams, setDiagrams] = useState([])
	const [loading, setLoading] = useState(false)
	const [openSelector, setOpenSelector] = useState(false)
	const [selectorType, setSelectorType] = useState(null)

	const changeValue = (e) => {
		onChange({ ...value, [e.target.name]: e.target.value })
	}

	const buildLink = (type, id) => {
		if (type === 'diagram') return `viewDiagram/${id}`
		if (type === 'map') return `map?id=${id}`
		return ''
	}

	const loadDiagrams = async () => {
		setLoading(true)
		try {
			const res = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/getDiagrams`,
				'GET'
			)
			setDiagrams(res.data || [])
		} catch (e) {
			console.error('Error cargando diagramas', e)
			setDiagrams([])
		} finally {
			setLoading(false)
		}
	}

	const loadMaps = async () => {
		setLoading(true)
		try {
			const res = await request(
				`${backend[import.meta.env.VITE_APP_NAME]}/maps`,
				'GET'
			)
			setMaps(res.data || [])
		} catch (e) {
			console.error('Error cargando mapas', e)
			setMaps([])
		} finally {
			setLoading(false)
		}
	}

	const handleAddDiagram = async () => {
		setSelectorType('diagram')
		setOpenSelector(true)
		if (diagrams.length === 0) await loadDiagrams()
	}

	const handleAddMap = async () => {
		setSelectorType('map')
		setOpenSelector(true)
		if (maps.length === 0) await loadMaps()
	}

	const handleSelectItem = (item) => {
		const link = buildLink(selectorType, item.id)
		onChange({ ...value, link })
		setOpenSelector(false)
	}

	const data = selectorType === 'diagram' ? diagrams : maps

	return (
		<>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-wrap gap-2'>
					<TextField
						type='text'
						label='Nombre'
						name='name'
						value={value.name}
						onChange={changeValue}
						size='small'
						sx={{ flex: '2 1 240px' }}
					/>
					<TextField
						type='text'
						label='Link'
						name='link'
						value={value.link}
						onChange={changeValue}
						size='small'
						sx={{ flex: '3 1 280px' }}
					/>
				</div>

				<div className='flex flex-wrap items-center gap-1.5'>
					<span className='text-[11px] text-slate-500 dark:text-gray-400 mr-1'>
						Autocompletar link desde:
					</span>
					<Button
						variant='outlined'
						size='small'
						startIcon={<AccountTree sx={{ fontSize: 16 }} />}
						onClick={handleAddDiagram}
						sx={pickerBtnSx}
					>
						Diagrama
					</Button>
					<Button
						variant='outlined'
						size='small'
						startIcon={<MapIcon sx={{ fontSize: 16 }} />}
						onClick={handleAddMap}
						sx={pickerBtnSx}
					>
						Mapa
					</Button>
				</div>

				<TextField
					label='Icono'
					name='icon'
					select
					size='small'
					value={value.icon}
					onChange={changeValue}
					SelectProps={{
						renderValue: (selected) => {
							const selectedItem = icons.find((item) => item.name === selected)
							return (
								<div className='flex gap-2 items-center'>
									{selectedItem ? (
										<>
											{selectedItem.icon}
											<span className='text-sm'>{selectedItem.title.toUpperCase()}</span>
										</>
									) : (
										<em className='text-slate-400'>Sin icono</em>
									)}
								</div>
							)
						},
					}}
				>
					<MenuItem value=''>
						<em>Sin icono</em>
					</MenuItem>
					{icons.map((item, index) => (
						<MenuItem key={index} value={item.name}>
							<div className='flex gap-2 items-center'>
								{item.icon}
								<span className='text-sm'>{item.title.toUpperCase()}</span>
							</div>
						</MenuItem>
					))}
				</TextField>
			</div>

			{/* -------- Selector Modal -------- */}
			<ModalShell
				open={openSelector}
				onClose={() => setOpenSelector(false)}
				eyebrow='Seleccionar origen'
				title={selectorType === 'diagram' ? 'Diagramas disponibles' : 'Mapas disponibles'}
				subtitle='Al seleccionar se autocompleta el link del menú'
				maxWidth='560px'
			>
				{loading ? (
					<div className='flex justify-center items-center min-h-[220px]'>
						<CircularProgress size={32} sx={{ color: '#2c6aa0' }} />
					</div>
				) : !data.length ? (
					<Box
						sx={{
							textAlign: 'center',
							py: 4,
							color: '#64748b',
							fontSize: '0.85rem',
							'body.dark &': { color: '#9ca3af' },
						}}
					>
						No hay datos disponibles
					</Box>
				) : (
					<List disablePadding sx={{ maxHeight: '60vh', overflow: 'auto' }}>
						{data.map((item) => (
							<ListItemButton
								key={item.id}
								onClick={() => handleSelectItem(item)}
								sx={{
									borderRadius: '10px',
									mb: 0.5,
									border: '1px solid rgba(15, 42, 68, 0.06)',
									transition: 'all 0.18s ease',
									'&:hover': {
										backgroundColor: 'rgba(54, 139, 237, 0.08)',
										borderColor: 'rgba(54, 139, 237, 0.3)',
										transform: 'translateX(2px)',
									},
									'body.dark &': {
										border: '1px solid rgba(255, 255, 255, 0.06)',
										'&:hover': {
											backgroundColor: 'rgba(94, 165, 240, 0.1)',
											borderColor: 'rgba(94, 165, 240, 0.3)',
										},
									},
								}}
							>
								<ListItemText
									primary={
										<span className='font-semibold text-slate-800 dark:text-gray-100'>
											{item.name || item.title || `ID ${item.id}`}
										</span>
									}
									secondary={
										<span className='text-[11px] font-mono text-slate-500 dark:text-gray-400'>
											ID: {item.id}
										</span>
									}
								/>
							</ListItemButton>
						))}
					</List>
				)}
			</ModalShell>
		</>
	)
}

export default FormMenu
