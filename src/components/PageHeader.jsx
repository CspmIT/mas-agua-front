import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'

const primaryActionSx = {
	borderRadius: '999px',
	textTransform: 'none',
	fontWeight: 500,
	letterSpacing: '0.01em',
	px: 2.5,
	py: 1,
	minHeight: 0,
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

const PageHeader = ({ title, subtitle, eyebrow, action, onCreate, createLabel, createIcon }) => {
	const resolvedAction =
		action ??
		(onCreate && (
			<Button
				onClick={onCreate}
				variant='contained'
				disableElevation
				startIcon={createIcon ?? <Add sx={{ fontSize: 18 }} />}
				sx={primaryActionSx}
			>
				{createLabel || 'Crear'}
			</Button>
		))

	return (
		<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4 px-1'>
			<div className='min-w-0'>
				{eyebrow && (
					<div className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#368bed] dark:text-[#5ea5f0] mb-1.5'>
						{eyebrow}
					</div>
				)}
				<h1 className='text-2xl sm:text-[26px] leading-tight font-medium tracking-tight text-slate-800 dark:text-gray-100'>
					{title}
				</h1>
				{subtitle && <p className='mt-1 text-sm text-slate-500 dark:text-gray-400'>{subtitle}</p>}
			</div>
			{resolvedAction && <div className='shrink-0 flex w-full justify-center sm:w-auto sm:justify-end'>{resolvedAction}</div>}
		</div>
	)
}

export default PageHeader
