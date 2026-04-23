import { Box } from '@mui/material'

const resolveBitValue = (value, id_bit) => {
	if (Array.isArray(value)) {
		return value.find((b) => b.id_bit === id_bit)?.value ?? 'Sin datos'
	}
	return value
}

const LedIndicator = ({
	label,
	value,
	id_bit,
	index = 0,
	textOn = 'Encendido',
	textOff = 'Apagado',
	colorOn = '#00ff00',
	colorOff = '#475569',
}) => {
	const resolvedValue = resolveBitValue(value, id_bit)
	const hasValue = resolvedValue !== 'Sin datos'
	const isOn = hasValue && Boolean(resolvedValue)

	const statusColor = !hasValue ? '#94a3b8' : isOn ? colorOn : colorOff
	const statusText = !hasValue ? 'Sin datos' : isOn ? textOn : textOff

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 0.75,
				height: '100%',
				px: 1.5,
				py: 1.25,
				borderRadius: '10px',
				backgroundColor: '#ffffff',
				border: '1px solid rgba(15, 42, 68, 0.08)',
				borderLeft: `3px solid ${statusColor}`,
				boxShadow: '0 1px 2px rgba(15, 42, 68, 0.04)',
				transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
				opacity: 0,
				transform: 'translateY(6px)',
				animation: `ledCardIn 0.35s ${index * 0.04}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				'@keyframes ledCardIn': {
					'0%': { opacity: 0, transform: 'translateY(6px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
				'&:hover': {
					transform: 'translateY(-1px)',
					boxShadow: '0 6px 16px -6px rgba(15, 42, 68, 0.18)',
					borderColor: 'rgba(54, 139, 237, 0.3)',
					borderLeftColor: statusColor,
				},
				'body.dark &': {
					backgroundColor: 'rgba(17, 24, 39, 0.8)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
					borderLeft: `3px solid ${statusColor}`,
					boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
				},
				'body.dark &:hover': {
					borderColor: 'rgba(94, 165, 240, 0.3)',
					borderLeftColor: statusColor,
					boxShadow: '0 6px 16px -6px rgba(0, 0, 0, 0.55)',
				},
			}}
		>
			<div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 leading-tight line-clamp-1'>
				{label}
			</div>

			<div className='flex items-center gap-2.5'>
				<Box
					sx={{
						position: 'relative',
						width: 14,
						height: 14,
						borderRadius: '50%',
						backgroundColor: statusColor,
						boxShadow: isOn
							? `0 0 0 2px ${statusColor}22, 0 0 8px ${statusColor}99`
							: `0 0 0 2px ${statusColor}1a`,
						flexShrink: 0,
						transition: 'all 0.2s ease',
						'&::after': isOn
							? {
									content: '""',
									position: 'absolute',
									inset: 0,
									borderRadius: '50%',
									border: `2px solid ${statusColor}`,
									opacity: 0.6,
									animation: 'ledPing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
								}
							: {},
						'@keyframes ledPing': {
							'0%': { transform: 'scale(1)', opacity: 0.55 },
							'80%, 100%': { transform: 'scale(1.35)', opacity: 0 },
						},
					}}
				/>
				<span
					className='text-base font-bold tracking-tight truncate'
					style={{
						color: !hasValue
							? '#94a3b8'
							: isOn
								? colorOn
								: '#475569',
					}}
				>
					{statusText}
				</span>
			</div>
		</Box>
	)
}

const MultipleBooleanChart = ({ title, items = [], columns = 2 }) => {
	if (!items.length) {
		return (
			<Box
				sx={{
					p: 2,
					borderRadius: '14px',
					border: '1px solid rgba(15, 42, 68, 0.08)',
					backgroundColor: '#ffffff',
					textAlign: 'center',
					color: '#64748b',
					fontSize: '0.8rem',
					'body.dark &': {
						backgroundColor: 'rgba(17, 24, 39, 0.8)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
						color: '#9ca3af',
					},
				}}
			>
				Sin indicadores configurados
			</Box>
		)
	}

	const gridCols = items.length > 6 ? 'grid-cols-3' : `grid-cols-${columns || 2}`

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				borderRadius: '14px',
				overflow: 'hidden',
				backgroundColor: '#ffffff',
				border: '1px solid rgba(15, 42, 68, 0.08)',
				boxShadow:
					'0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
				transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'&:hover': {
					boxShadow:
						'0 4px 10px rgba(15, 42, 68, 0.06), 0 18px 40px -14px rgba(15, 42, 68, 0.18)',
				},
				'body.dark &': {
					backgroundColor: 'rgba(17, 24, 39, 0.85)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
					boxShadow:
						'0 2px 6px rgba(0, 0, 0, 0.25), 0 12px 32px -12px rgba(0, 0, 0, 0.5)',
				},
			}}
		>
			{title && (
				<div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10 shrink-0'>
					<h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
						{title}
					</h2>
				</div>
			)}

			<Box
				sx={{
					flex: 1,
					p: 1.25,
					backgroundColor: '#f8fafc',
					'body.dark &': { backgroundColor: 'rgba(15, 23, 42, 0.3)' },
				}}
			>
				<div className={`grid ${gridCols} gap-1.5 h-full auto-rows-fr`}>
					{items.map((item, i) => (
						<LedIndicator
							key={item.key}
							index={i}
							label={item.title}
							value={item.value}
							id_bit={item.id_bit}
							textOn={item.textOn}
							textOff={item.textOff}
							colorOn={item.colorOn}
							colorOff={item.colorOff}
						/>
					))}
				</div>
			</Box>
		</Box>
	)
}

export default MultipleBooleanChart
