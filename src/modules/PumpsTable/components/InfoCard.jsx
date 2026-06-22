import { Box } from '@mui/material'

const palette = {
	green: { pill: 'rgba(16, 185, 129, 0.14)', text: '#065f46', dot: '#10b981', dPill: 'rgba(16, 185, 129, 0.2)', dText: '#6ee7b7' },
	blue: { pill: 'rgba(54, 139, 237, 0.14)', text: '#1e3a8a', dot: '#368bed', dPill: 'rgba(94, 165, 240, 0.2)', dText: '#93c5fd' },
	indigo: { pill: 'rgba(99, 102, 241, 0.14)', text: '#3730a3', dot: '#6366f1', dPill: 'rgba(129, 140, 248, 0.2)', dText: '#a5b4fc' },
	orange: { pill: 'rgba(216, 98, 29, 0.14)', text: '#7c2d12', dot: '#d8621d', dPill: 'rgba(251, 146, 60, 0.2)', dText: '#fdba74' },
	red: { pill: 'rgba(225, 29, 72, 0.14)', text: '#881337', dot: '#e11d48', dPill: 'rgba(244, 63, 94, 0.2)', dText: '#fca5a5' },
}

const InfoCard = ({ label, value, color, index = 0 }) => {
	const c = palette[color] || palette.blue

	return (
		<Box
			sx={{
				position: 'relative',
				borderRadius: '14px',
				border: '1px solid rgba(15, 42, 68, 0.08)',
				backgroundColor: '#ffffff',
				px: 2,
				py: 1.75,
				boxShadow: '0 1px 2px rgba(15,42,68,0.04), 0 4px 12px -6px rgba(15,42,68,0.08)',
				opacity: 0,
				transform: 'translateY(10px)',
				animation: `infoCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.06}s forwards`,
				transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s',
				'@keyframes infoCardIn': {
					'0%': { opacity: 0, transform: 'translateY(10px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
				'&:hover': {
					transform: 'translateY(-2px)',
					borderColor: 'rgba(44, 106, 160, 0.25)',
					boxShadow: '0 4px 8px rgba(15,42,68,0.06), 0 14px 28px -10px rgba(15,42,68,0.15)',
				},
				'body.dark &': {
					backgroundColor: 'rgba(31, 41, 55, 0.75)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
					boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 4px 12px -6px rgba(0,0,0,0.35)',
				},
				'body.dark &:hover': {
					borderColor: 'rgba(94, 165, 240, 0.3)',
					boxShadow: '0 4px 8px rgba(0,0,0,0.25), 0 14px 28px -10px rgba(0,0,0,0.45)',
				},
			}}
		>
			<div className='flex items-center gap-1.5 mb-1.5'>
				<Box
					sx={{
						width: 7,
						height: 7,
						borderRadius: '50%',
						backgroundColor: c.dot,
						boxShadow: `0 0 0 3px ${c.dot}22`,
					}}
				/>
				<span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-400'>
					{label}
				</span>
			</div>
			<Box
				sx={{
					display: 'inline-block',
					px: 1.5,
					py: 0.5,
					borderRadius: '8px',
					fontSize: '0.875rem',
					fontWeight: 600,
					letterSpacing: '0.005em',
					backgroundColor: c.pill,
					color: c.text,
					maxWidth: '100%',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					'body.dark &': {
						backgroundColor: c.dPill,
						color: c.dText,
					},
				}}
			>
				{value}
			</Box>
		</Box>
	)
}

export default InfoCard
