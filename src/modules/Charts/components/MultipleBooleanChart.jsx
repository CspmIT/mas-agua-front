import { Box } from '@mui/material'

/**
 * Estado para variables calc_binary.
 * El back devuelve un `image` (default | success | error | warning) por cada
 * combinación de bits; acá lo traducimos a color de LED, color de texto y si el
 * LED "pulsa" (estado activo). Debe quedar alineado con IMAGE_OPTIONS de BitCalcVarModal.
 */
const CALC_BINARY_STATE = {
	default: { color: '#94a3b8', text: '#475569', active: false },
	success: { color: '#22c55e', text: '#15803d', active: true },
	error: { color: '#ef4444', text: '#b91c1c', active: true },
	warning: { color: '#f59e0b', text: '#b45309', active: true },
}

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
	isCalcBinary = false,
}) => {
	// calc_binary: value = { index, bitValues, image, label }. Detectamos por flag o por forma.
	const looksCalcBinary =
		value && typeof value === 'object' && !Array.isArray(value) &&
		'image' in value && 'label' in value
	const calcMode = isCalcBinary || looksCalcBinary

	let statusColor, statusText, statusTextColor, isActive

	if (calcMode) {
		const st = looksCalcBinary
			? (CALC_BINARY_STATE[value.image] ?? CALC_BINARY_STATE.default)
			: CALC_BINARY_STATE.default
		statusColor = st.color
		statusTextColor = looksCalcBinary ? st.text : '#94a3b8'
		statusText = looksCalcBinary ? (value.label || 'Sin definir') : 'Sin datos'
		isActive = looksCalcBinary && st.active
	} else {
		const resolvedValue = resolveBitValue(value, id_bit)
		const hasValue = resolvedValue !== 'Sin datos'
		const isOn = hasValue && Boolean(resolvedValue)
		statusColor = !hasValue ? '#94a3b8' : isOn ? colorOn : colorOff
		statusTextColor = !hasValue ? '#94a3b8' : isOn ? colorOn : '#475569'
		statusText = !hasValue ? 'Sin datos' : isOn ? textOn : textOff
		isActive = isOn
	}

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 0.75,
				flex: '0 1 auto',
				minWidth: 90,
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
						boxShadow: isActive
							? `0 0 0 2px ${statusColor}22, 0 0 8px ${statusColor}99`
							: `0 0 0 2px ${statusColor}1a`,
						flexShrink: 0,
						transition: 'all 0.2s ease',
						'&::after': isActive
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
					className='text-base font-bold tracking-tight whitespace-nowrap'
					style={{ color: statusTextColor }}
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

	// Ordenamos las cards alfabéticamente por label (numeric: "Bomba 9" antes de "Bomba 10")
	const sortedItems = [...items].sort((a, b) =>
		String(a.title ?? '').localeCompare(String(b.title ?? ''), 'es', {
			numeric: true,
			sensitivity: 'base',
		})
	)

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
					minHeight: 0,
					p: 1.25,
					backgroundColor: '#f8fafc',
					'body.dark &': { backgroundColor: 'rgba(15, 23, 42, 0.3)' },
				}}
			>
				<div className='flex flex-wrap content-stretch items-stretch justify-center gap-1.5 h-full overflow-auto'>
					{sortedItems.map((item, i) => (
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
							isCalcBinary={item.isCalcBinary}
						/>
					))}
				</div>
			</Box>
		</Box>
	)
}

export default MultipleBooleanChart
