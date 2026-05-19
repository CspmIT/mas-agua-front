import { Box, Tooltip } from '@mui/material'
import { FaEye, FaRegClock } from 'react-icons/fa'
import { MdNotificationsActive, MdNotificationsNone } from 'react-icons/md'
import { parseAlarmMessage, relativeLabel, parseTriggeredAt } from '../utils/parseAlarm'

const AlarmCard = ({ alarm, onMarkAsRead, index = 0 }) => {
	const { id, message, value, viewed, triggeredAt } = alarm
	const parsed = parseAlarmMessage(message)
	const date = parseTriggeredAt(triggeredAt)
	const relative = relativeLabel(date)

	const Icon = viewed ? MdNotificationsNone : MdNotificationsActive
	const hasValue = value != null && value !== ''

	const cardBackground = viewed
		? 'linear-gradient(180deg, #ffffff 0%, #fafbfd 100%)'
		: 'linear-gradient(180deg, #fefce8 0%, rgba(250,204,21,0.16) 100%)'

	const cardShadow = viewed
		? '0 1px 2px rgba(15,42,68,0.05), 0 3px 8px -3px rgba(15,42,68,0.09), inset 0 1px 0 rgba(255,255,255,0.8)'
		: '0 1px 2px rgba(161,98,7,0.08), 0 4px 14px -4px rgba(234,179,8,0.3), inset 0 1px 0 rgba(255,255,255,0.85)'

	const cardShadowHover = viewed
		? '0 2px 4px rgba(15,42,68,0.06), 0 10px 20px -8px rgba(15,42,68,0.16), inset 0 1px 0 rgba(255,255,255,0.85)'
		: '0 2px 4px rgba(161,98,7,0.12), 0 16px 28px -10px rgba(234,179,8,0.42), inset 0 1px 0 rgba(255,255,255,0.9)'

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'flex',
				gap: 1.75,
				p: 1.75,
				pl: 2.25,
				borderRadius: '14px',
				background: cardBackground,
				border: '1px solid',
				borderColor: viewed ? 'rgba(15,42,68,0.08)' : 'rgba(234,179,8,0.42)',
				boxShadow: cardShadow,
				transition:
					'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease',
				opacity: 0,
				transform: 'translateY(5px)',
				animation: `alarmCardIn 0.34s cubic-bezier(0.22,1,0.36,1) ${index * 38}ms forwards`,
				'@keyframes alarmCardIn': {
					to: { opacity: 1, transform: 'translateY(0)' },
				},
				'@keyframes alarmRailPulse': {
					'0%, 100%': { boxShadow: '0 0 6px rgba(250,204,21,0.5)' },
					'50%': { boxShadow: '0 0 14px rgba(250,204,21,0.85)' },
				},
				'@keyframes alarmBellShake': {
					'0%, 90%, 100%': { transform: 'rotate(0deg)' },
					'3%, 9%': { transform: 'rotate(-10deg)' },
					'6%, 12%': { transform: 'rotate(10deg)' },
					'15%': { transform: 'rotate(0deg)' },
				},
				'&:hover': {
					transform: 'translateY(-1px)',
					boxShadow: cardShadowHover,
					borderColor: viewed ? 'rgba(15,42,68,0.14)' : 'rgba(234,179,8,0.65)',
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					left: 0,
					top: 8,
					bottom: 8,
					width: viewed ? '3px' : '4px',
					borderRadius: '0 4px 4px 0',
					background: viewed
						? '#cbd5e1'
						: 'linear-gradient(180deg, #fde047 0%, #facc15 55%, #eab308 100%)',
					boxShadow: viewed ? 'none' : '0 0 8px rgba(250,204,21,0.65)',
					animation: viewed ? 'none' : 'alarmRailPulse 2.4s ease-in-out infinite',
				},
				'body.dark &': {
					background: viewed
						? 'linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.5) 100%)'
						: 'linear-gradient(180deg, rgba(66,32,6,0.3) 0%, rgba(250,204,21,0.14) 100%)',
					borderColor: viewed ? 'rgba(255,255,255,0.06)' : 'rgba(253,224,71,0.42)',
					boxShadow: viewed
						? '0 1px 2px rgba(0,0,0,0.22), 0 3px 8px -3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
						: '0 1px 2px rgba(0,0,0,0.22), 0 4px 14px -4px rgba(253,224,71,0.38), inset 0 1px 0 rgba(255,255,255,0.06)',
					'&::before': {
						background: viewed
							? 'rgba(148,163,184,0.45)'
							: 'linear-gradient(180deg, #fef08a 0%, #facc15 100%)',
						boxShadow: viewed ? 'none' : '0 0 8px rgba(253,224,71,0.7)',
					},
					'&:hover': {
						borderColor: viewed ? 'rgba(255,255,255,0.14)' : 'rgba(253,224,71,0.65)',
						boxShadow: viewed
							? '0 2px 4px rgba(0,0,0,0.28), 0 10px 20px -8px rgba(0,0,0,0.45)'
							: '0 2px 4px rgba(0,0,0,0.28), 0 16px 28px -10px rgba(253,224,71,0.55)',
					},
				},
			}}
		>
			<Box
				sx={{
					flexShrink: 0,
					width: 38,
					height: 38,
					borderRadius: '11px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: viewed
						? 'linear-gradient(145deg, #f3f5f9 0%, #e5eaf1 100%)'
						: 'linear-gradient(145deg, #fef08a 0%, #facc15 100%)',
					color: viewed ? '#64748b' : '#713f12',
					border: '1px solid',
					borderColor: viewed ? 'rgba(15,42,68,0.06)' : 'rgba(202,138,4,0.5)',
					boxShadow: viewed
						? 'inset 0 1px 0 rgba(255,255,255,0.7)'
						: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px -2px rgba(234,179,8,0.42)',
					'& svg': viewed
						? {}
						: {
								animation: 'alarmBellShake 2.8s ease-in-out infinite',
								transformOrigin: '50% 0%',
						  },
					'body.dark &': {
						background: viewed
							? 'linear-gradient(145deg, rgba(148,163,184,0.14) 0%, rgba(148,163,184,0.06) 100%)'
							: 'linear-gradient(145deg, rgba(253,224,71,0.32) 0%, rgba(250,204,21,0.2) 100%)',
						borderColor: viewed ? 'rgba(255,255,255,0.06)' : 'rgba(253,224,71,0.38)',
						color: viewed ? '#94a3b8' : '#fef08a',
					},
				}}
			>
				<Icon size={18} />
			</Box>

			<div className='flex-1 min-w-0'>
				<div className='flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1'>
					<span className='inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-500 dark:text-slate-400'>
						<FaRegClock size={10} className='opacity-70' />
						<span className='tabular-nums'>{triggeredAt}</span>
					</span>
					{relative && (
						<span className='text-[11px] text-slate-400 dark:text-slate-500'>· {relative}</span>
					)}
				</div>

				<h4
					className='text-[15px] leading-tight font-semibold tracking-tight text-slate-800 dark:text-gray-100 truncate'
					title={parsed.alarmName || 'Alarma'}
				>
					{parsed.alarmName || 'Alarma sin nombre'}
				</h4>

				{hasValue && (
					<div className='mt-1.5 inline-flex items-center gap-1.5'>
						<span className='text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-400 dark:text-slate-500'>
							Valor
						</span>
						<span
							className='font-mono text-[13px] font-semibold rounded px-2 py-[2px]'
							style={
								viewed
									? {
											color: '#1f4e79',
											background:
												'linear-gradient(180deg, rgba(54,139,237,0.14) 0%, rgba(54,139,237,0.06) 100%)',
											border: '1px solid rgba(54,139,237,0.18)',
											boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
									  }
									: {
											color: '#713f12',
											background:
												'linear-gradient(180deg, rgba(253,224,71,0.34) 0%, rgba(250,204,21,0.16) 100%)',
											border: '1px solid rgba(202,138,4,0.4)',
											boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
									  }
							}
						>
							{value}
						</span>
					</div>
				)}

				{(() => {
					const conditionText =
						parsed.kind === 'combined'
							? parsed.parts?.join(` ${parsed.operator} `)
							: parsed.condition
					if (!conditionText) return null
					return (
						<div className='mt-1.5 text-[12.5px] leading-snug'>
							<span
								className='font-mono text-[12px] text-slate-600 dark:text-slate-300 rounded px-1.5 py-[1px]'
								style={{
									background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
									border: '1px solid rgba(15,42,68,0.08)',
									boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
								}}
							>
								{conditionText}
							</span>
						</div>
					)
				})()}
			</div>

			{!viewed && (
				<Tooltip title='Marcar como leída' placement='left'>
					<button
						type='button'
						onClick={() => onMarkAsRead(id)}
						aria-label='Marcar como leída'
						className='self-start shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-[1px]'
						style={{
							background: 'linear-gradient(145deg, #facc15 0%, #a16207 100%)',
							boxShadow:
								'0 2px 6px rgba(161,98,7,0.38), inset 0 1px 0 rgba(255,255,255,0.35)',
							color: '#ffffff',
							padding: 0,
							border: '1px solid rgba(133,77,14,0.55)',
							lineHeight: 0,
						}}
					>
						<FaEye size={15} />
					</button>
				</Tooltip>
			)}
		</Box>
	)
}

export default AlarmCard
