// Builders de opciones de ECharts para el dashboard de auditoría.
// Un solo tono por gráfico (la identidad la da el eje, no el color) y
// colores de estado reservados para la distribución de status HTTP.

const GRID_LINE = 'rgba(148, 163, 184, 0.25)'

const textColor = (darkMode) => (darkMode ? '#9ca3af' : '#64748b')

const tooltipStyle = (darkMode) => ({
	backgroundColor: darkMode ? '#1f2937' : '#ffffff',
	borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,42,68,0.1)',
	textStyle: { color: darkMode ? '#e5e7eb' : '#334155', fontSize: 12 },
})

export const formatMs = (ms) => {
	if (ms == null || Number.isNaN(Number(ms))) return '—'
	if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
	return `${Math.round(ms)} ms`
}

export const formatTotalMs = (ms) => {
	if (ms == null) return '—'
	if (ms >= 60000) return `${(ms / 60000).toFixed(1)} min`
	if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
	return `${Math.round(ms)} ms`
}

const baseAxes = (darkMode) => ({
	axisLabel: { color: textColor(darkMode), hideOverlap: true },
	axisLine: { lineStyle: { color: GRID_LINE } },
	axisTick: { show: false },
})

// Barras verticales (series temporales: tráfico diario, logins, requests por hora)
export const verticalBars = ({ labels, values, name, color, darkMode, valueFormatter }) => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' },
		...tooltipStyle(darkMode),
		...(valueFormatter ? { valueFormatter } : {}),
	},
	grid: { left: 8, right: 8, top: 24, bottom: 4, containLabel: true },
	xAxis: { type: 'category', data: labels, ...baseAxes(darkMode) },
	yAxis: {
		type: 'value',
		axisLabel: { color: textColor(darkMode) },
		splitLine: { lineStyle: { color: GRID_LINE } },
	},
	series: [
		{
			name,
			type: 'bar',
			data: values,
			itemStyle: { color, borderRadius: [4, 4, 0, 0] },
			barMaxWidth: 22,
		},
	],
})

// Línea con área suave (tiempo de respuesta por día)
export const lineArea = ({ labels, values, name, color, darkMode, valueFormatter }) => ({
	tooltip: {
		trigger: 'axis',
		...tooltipStyle(darkMode),
		...(valueFormatter ? { valueFormatter } : {}),
	},
	grid: { left: 8, right: 8, top: 24, bottom: 4, containLabel: true },
	xAxis: { type: 'category', data: labels, boundaryGap: false, ...baseAxes(darkMode) },
	yAxis: {
		type: 'value',
		axisLabel: { color: textColor(darkMode), formatter: valueFormatter },
		splitLine: { lineStyle: { color: GRID_LINE } },
	},
	series: [
		{
			name,
			type: 'line',
			data: values,
			lineStyle: { width: 2, color },
			itemStyle: { color },
			showSymbol: false,
			connectNulls: true,
			areaStyle: { color, opacity: 0.12 },
		},
	],
})

// Barras horizontales (rankings: módulos, usuarios, endpoints). El primero
// queda arriba. labelWidth agranda el eje para etiquetas largas (endpoints)
// y tooltipFormatter permite un tooltip enriquecido.
export const horizontalBars = ({
	labels,
	values,
	name,
	color,
	darkMode,
	valueFormatter,
	labelWidth = 130,
	tooltipFormatter,
}) => ({
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' },
		...tooltipStyle(darkMode),
		...(tooltipFormatter ? { formatter: tooltipFormatter } : {}),
		...(valueFormatter && !tooltipFormatter ? { valueFormatter } : {}),
	},
	grid: { left: 8, right: 24, top: 8, bottom: 4, containLabel: true },
	xAxis: {
		type: 'value',
		axisLabel: { color: textColor(darkMode), formatter: valueFormatter },
		splitLine: { lineStyle: { color: GRID_LINE } },
	},
	yAxis: {
		type: 'category',
		data: [...labels].reverse(),
		...baseAxes(darkMode),
		axisLabel: { color: textColor(darkMode), width: labelWidth, overflow: 'truncate' },
	},
	series: [
		{
			name,
			type: 'bar',
			data: [...values].reverse(),
			itemStyle: { color, borderRadius: [0, 4, 4, 0] },
			barMaxWidth: 18,
		},
	],
})

// Donut para la distribución de status HTTP (colores de estado reservados)
export const donut = ({ data, darkMode }) => ({
	tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', ...tooltipStyle(darkMode) },
	legend: {
		bottom: 0,
		icon: 'circle',
		itemWidth: 10,
		itemHeight: 10,
		textStyle: { color: textColor(darkMode), fontSize: 12 },
	},
	series: [
		{
			type: 'pie',
			radius: ['52%', '74%'],
			center: ['50%', '44%'],
			avoidLabelOverlap: true,
			label: { show: false },
			itemStyle: { borderWidth: 2, borderColor: darkMode ? '#3f3f46' : '#ffffff' },
			emphasis: { label: { show: false } },
			data,
		},
	],
})
