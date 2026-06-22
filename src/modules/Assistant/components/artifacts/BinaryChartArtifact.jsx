import { useMemo } from 'react'
import EChart from '../../../Charts/components/EChart'
import ArtifactShell from './ArtifactShell'
import { shortTime } from './utils/artifactStyles'

/**
 * Render para artifacts type='binary_chart' (bits individuales).
 * Usa step:'end' — el valor previo se mantiene hasta el siguiente punto.
 *
 * @param {{ data: any }} props
 */
const BinaryChartArtifact = ({ data }) => {
	const {
		variable_name,
		bit_name,
		series = [],
		stats = {},
		range_label,
	} = data

	const lastState = stats.last_state // 'on' | 'off' | null

	const option = useMemo(() => {
		const labels = series.map((p) => p.time_label)
		const values = series.map((p) => p.value)

		return {
			backgroundColor: 'transparent',
			grid: { left: 50, right: 16, top: 12, bottom: 28, containLabel: false },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'line', lineStyle: { color: '#10B981', opacity: 0.4 } },
				formatter: (params) => {
					const p = params?.[0]
					if (!p) return ''
					const label = labels[p.dataIndex] || ''
					const state = p.value === 1 ? 'ON' : 'OFF'
					const color = p.value === 1 ? '#10B981' : '#94a3b8'
					return `<div style="font-size:11px;color:#64748b;margin-bottom:4px">${label}</div>
						<div style="font-size:12px;font-weight:600;color:#1f4e79">${bit_name}:
						<span style="color:${color}">${state}</span></div>`
				},
				backgroundColor: 'rgba(255,255,255,0.97)',
				borderColor: 'rgba(31,78,121,0.15)',
				borderWidth: 1,
				padding: [8, 10],
				textStyle: { color: '#1f4e79' },
				extraCssText: 'box-shadow:0 8px 22px -10px rgba(15,42,68,0.30);border-radius:10px;',
			},
			xAxis: {
				type: 'category',
				data: labels,
				boundaryGap: false,
				axisLine: { lineStyle: { color: '#cbd5e1' } },
				axisTick: { show: false },
				axisLabel: {
					color: '#64748b',
					fontSize: 10,
					formatter: (value) => shortTime(value),
					hideOverlap: true,
				},
			},
			yAxis: {
				type: 'value',
				min: -0.15,
				max: 1.15,
				interval: 1,
				splitLine: { lineStyle: { color: 'rgba(148,163,184,0.18)' } },
				axisLabel: {
					color: '#94a3b8',
					fontSize: 10,
					formatter: (v) => (v === 1 ? 'ON' : v === 0 ? 'OFF' : ''),
				},
			},
			series: [
				{
					type: 'line',
					step: 'end',
					data: values,
					showSymbol: false,
					lineStyle: { color: '#10B981', width: 2 },
					itemStyle: { color: '#10B981' },
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [
								{ offset: 0, color: 'rgba(16,185,129,0.22)' },
								{ offset: 1, color: 'rgba(16,185,129,0.02)' },
							],
						},
					},
				},
			],
		}
	}, [series, bit_name])

	const statsCells = [
		{ label: 'Tiempo ON', value: `${(stats.on_percentage ?? 0).toFixed(1)}%` },
		{ label: 'Transiciones', value: stats.transitions ?? 0 },
		{ label: 'Streak ON máx', value: `${stats.longest_on_streak_minutes ?? 0} min` },
		{ label: 'Streak OFF máx', value: `${stats.longest_off_streak_minutes ?? 0} min` },
	]

	const caption = stats.last_change_label
		? `Último cambio: ${stats.last_change_label}`
		: null

	return (
		<ArtifactShell
			title={bit_name}
			subtitle={variable_name}
			rangeLabel={range_label}
			caption={caption}
			badge={<StateBadge state={lastState} />}
			stats={statsCells}
		>
			<div className='h-[160px]'>
				{series.length > 0 ? (
					<EChart config={option} />
				) : (
					<div className='h-full flex items-center justify-center text-[12px] text-slate-400 dark:text-slate-500 italic'>
						Sin puntos para graficar
					</div>
				)}
			</div>
		</ArtifactShell>
	)
}

const StateBadge = ({ state }) => {
	if (state === 'on') {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full border text-[11px] font-semibold bg-[#10B981]/10 border-[#10B981]/35 text-[#047857] dark:text-[#34d399]'>
				<span className='relative flex w-2 h-2'>
					<span className='absolute inline-flex w-full h-full rounded-full bg-[#10B981]/40 animate-ping' />
					<span className='relative inline-flex w-2 h-2 rounded-full bg-[#10B981]' />
				</span>
				ON
			</span>
		)
	}
	if (state === 'off') {
		return (
			<span className='inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full border text-[11px] font-semibold bg-slate-200/50 dark:bg-white/5 border-slate-300/40 text-slate-600 dark:text-slate-300'>
				<span className='inline-block w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500' />
				OFF
			</span>
		)
	}
	return null
}

export default BinaryChartArtifact
