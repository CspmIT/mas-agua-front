import { Box, Button } from '@mui/material'

const chipBase = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 1.5,
	py: 0.35,
	minHeight: 0,
	fontSize: '0.75rem',
	lineHeight: 1.4,
}

const editSx = {
	...chipBase,
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 3px 10px rgba(44, 106, 160, 0.3)',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 6px 16px rgba(44, 106, 160, 0.4)',
	},
}

const toggleSx = (active) => ({
	...chipBase,
	borderColor: active ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
	color: active ? '#b91c1c' : '#047857',
	'&:hover': {
		borderColor: active ? '#ef4444' : '#10b981',
		backgroundColor: active ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
	},
})

const deleteSx = {
	...chipBase,
	borderColor: 'rgba(239, 68, 68, 0.4)',
	color: '#b91c1c',
	'&:hover': {
		borderColor: '#ef4444',
		backgroundColor: 'rgba(239, 68, 68, 0.08)',
	},
}

const tonePalette = {
	accent: { border: 'rgba(216, 98, 29, 0.4)', borderHover: '#d8621d', bg: 'rgba(216, 98, 29, 0.08)', color: '#c2410c' },
	info: { border: 'rgba(54, 139, 237, 0.4)', borderHover: '#368bed', bg: 'rgba(54, 139, 237, 0.08)', color: '#1d4ed8' },
	slate: { border: 'rgba(71, 85, 105, 0.35)', borderHover: '#475569', bg: 'rgba(71, 85, 105, 0.08)', color: '#334155' },
	success: { border: 'rgba(16, 185, 129, 0.4)', borderHover: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', color: '#047857' },
	warning: { border: 'rgba(234, 179, 8, 0.45)', borderHover: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', color: '#a16207' },
}

const toneSx = (tone = 'info') => {
	const t = tonePalette[tone] ?? tonePalette.info
	return {
		...chipBase,
		borderColor: t.border,
		color: t.color,
		'&:hover': { borderColor: t.borderHover, backgroundColor: t.bg },
	}
}

export const EditChip = ({ children = 'Editar', disabled, onClick }) => (
	<Button
		variant='contained'
		size='small'
		disabled={disabled}
		disableElevation
		onClick={onClick}
		sx={editSx}
	>
		{children}
	</Button>
)

export const StatusToggleChip = ({
	active,
	activeLabel = 'Desactivar',
	inactiveLabel = 'Activar',
	onClick,
}) => (
	<Button variant='outlined' size='small' onClick={onClick} sx={toggleSx(active)}>
		{active ? activeLabel : inactiveLabel}
	</Button>
)

export const DeleteChip = ({ children = 'Eliminar', onClick }) => (
	<Button variant='outlined' size='small' onClick={onClick} sx={deleteSx}>
		{children}
	</Button>
)

export const ToneChip = ({ children, tone = 'info', onClick, disabled }) => (
	<Button
		variant='outlined'
		size='small'
		disabled={disabled}
		onClick={onClick}
		sx={toneSx(tone)}
	>
		{children}
	</Button>
)

export const ActionsRow = ({ children }) => (
	<Box display='flex' gap={0.75} flexWrap='wrap'>
		{children}
	</Box>
)

export const StatusPill = ({
	active,
	activeLabel = 'Activo',
	inactiveLabel = 'Inactivo',
}) => (
	<Box
		component='span'
		sx={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 0.75,
			px: 1.25,
			py: 0.25,
			borderRadius: '999px',
			fontSize: '0.72rem',
			fontWeight: 600,
			letterSpacing: '0.02em',
			backgroundColor: active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
			color: active ? '#047857' : '#b91c1c',
			border: `1px solid ${active ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)'}`,
		}}
	>
		<Box
			component='span'
			sx={{
				width: 6,
				height: 6,
				borderRadius: '50%',
				backgroundColor: active ? '#10b981' : '#ef4444',
				boxShadow: active
					? '0 0 0 2px rgba(16, 185, 129, 0.18)'
					: '0 0 0 2px rgba(239, 68, 68, 0.18)',
			}}
		/>
		{active ? activeLabel : inactiveLabel}
	</Box>
)
