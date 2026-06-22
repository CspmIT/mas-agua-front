import { useMemo } from 'react'
import EChart from '../../../Charts/components/EChart'
import ArtifactShell, { TrendBadge } from './ArtifactShell'
import {
	TREND_STYLES,
	formatNumber,
	formatValueWithUnit,
	shortTime,
} from './utils/artifactStyles'

/**
 * Render para artifacts type='line_chart' (variables numéricas y
 * palabra cruda de binary sin bit_id).
 *
 * @param {{ data: any }} props
 */
const LineChartArtifact = ({ data }) => {
	const { variable_name, unit, series = [], stats = {}, range_label, subtitle } = data
	const trend = TREND_STYLES[stats.trend] || TREND_STYLES.no_data

	const option = useMemo(() => {
		const labels = series.map((p) => p.time_label)
		const values = series.map((p) => p.value)
		const title = unit ? `${variable_name} (${unit})` : variable_name

		return {
			backgroundColor: 'transparent',
			grid: { left: 44, right: 16, top: 12, bottom: 28, containLabel: false },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'line', lineStyle: { color: '#368bed', opacity: 0.4 } },
				formatter: (params) => {
					const p = params?.[0]
					if (!p) return ''
					const label = labels[p.dataIndex] || ''
					const val = formatValueWithUnit(p.value, unit)
					return `<div style="font-size:11px;color:#64748b;margin-bottom:4px">${label}</div>
						<div style="font-size:12px;font-weight:600;color:#1f4e79">${title}: ${val}</div>`
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
				scale: true,
				splitLine: { lineStyle: { color: 'rgba(148,163,184,0.18)' } },
				axisLabel: { color: '#94a3b8', fontSize: 10 },
			},
			series: [
				{
					type: 'line',
					data: values,
					smooth: true,
					showSymbol: false,
					symbol: 'circle',
					symbolSize: 6,
					lineStyle: { color: '#368bed', width: 2 },
					itemStyle: { color: '#368bed' },
					areaStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [
								{ offset: 0, color: 'rgba(54,139,237,0.25)' },
								{ offset: 1, color: 'rgba(54,139,237,0.02)' },
							],
						},
					},
					markPoint: {
						symbol: 'pin',
						symbolSize: 36,
						label: {
							fontSize: 9,
							color: '#fff',
							formatter: (p) => formatNumber(p.value),
						},
						data: [
							{ type: 'max', name: 'Máx', itemStyle: { color: '#10B981' } },
							{ type: 'min', name: 'Mín', itemStyle: { color: '#ef4444' } },
						],
					},
				},
			],
		}
	}, [series, unit, variable_name])

	const statsCells = [
		{ label: 'Mín', value: formatValueWithUnit(stats.min, unit) },
		{ label: 'Máx', value: formatValueWithUnit(stats.max, unit) },
		{ label: 'Promedio', value: formatValueWithUnit(stats.mean, unit) },
		{ label: 'Actual', value: formatValueWithUnit(stats.last_value, unit) },
	]

	const title = unit ? `${variable_name} (${unit})` : variable_name

	return (
		<ArtifactShell
			title={title}
			subtitle={subtitle}
			rangeLabel={range_label}
			caption={stats.trend_description}
			badge={<TrendBadge style={trend} />}
			stats={statsCells}
		>
			<div className='h-[220px]'>
				{series.length > 0 ? (
					<EChart config={option} />
				) : (
					<EmptyState message='Sin puntos para graficar' />
				)}
			</div>
		</ArtifactShell>
	)
}

const EmptyState = ({ message }) => (
	<div className='h-full flex items-center justify-center text-[12px] text-slate-400 dark:text-slate-500 italic'>
		{message}
	</div>
)

export default LineChartArtifact
