import { Box, Button } from '@mui/material'
import { FilterAltOutlined, RestartAltOutlined } from '@mui/icons-material'

const shellSx = {
	borderRadius: '12px',
	border: '1px solid rgba(15, 42, 68, 0.06)',
	backgroundColor: '#ffffff',
	p: 1,
	mb: 1.5,
	'body.dark &': {
		border: '1px solid rgba(255, 255, 255, 0.06)',
		backgroundColor: 'rgba(17, 24, 39, 0.6)',
	},
}

const primaryPillSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 1.75,
	py: 0.5,
	minHeight: 0,
	fontSize: '0.78rem',
	background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
	boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
	transition: 'box-shadow 0.2s ease, transform 0.2s ease',
	'&:hover': {
		background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
		boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
		transform: 'translateY(-1px)',
	},
	'&:active': { transform: 'translateY(0)' },
}

const ghostPillSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	px: 1.75,
	py: 0.5,
	minHeight: 0,
	fontSize: '0.78rem',
	borderColor: 'rgba(15, 42, 68, 0.14)',
	color: '#475569',
	'&:hover': {
		borderColor: '#2c6aa0',
		backgroundColor: 'rgba(44, 106, 160, 0.06)',
	},
	'body.dark &': {
		borderColor: 'rgba(255,255,255,0.14)',
		color: '#cbd5e1',
	},
}

const FiltersBar = ({ children, onFilter, onReset, showReset = true, showFilter = true }) => (
	<Box sx={shellSx}>
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onFilter?.()
			}}
			className='flex flex-wrap items-center gap-1.5'
		>
			{children}
			{(showFilter || showReset) && (
				<div className='flex gap-1.5 w-full justify-center sm:w-auto sm:justify-start shrink-0'>
					{showFilter && (
						<Button
							type='submit'
							variant='contained'
							disableElevation
							startIcon={<FilterAltOutlined sx={{ fontSize: 15 }} />}
							sx={primaryPillSx}
						>
							Filtrar
						</Button>
					)}
					{showReset && (
						<Button
							variant='outlined'
							startIcon={<RestartAltOutlined sx={{ fontSize: 15 }} />}
							sx={ghostPillSx}
							onClick={onReset}
						>
							Limpiar
						</Button>
					)}
				</div>
			)}
		</form>
	</Box>
)

export default FiltersBar
