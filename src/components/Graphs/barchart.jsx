import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { MainContext } from '../../context/MainContext'
import { useContext } from 'react'
function GrafBarra({ ...props }) {
	const { darkMode } = useContext(MainContext)

	// Modo multi-serie: props.series = [{ name, color, data: [...] }] + props.categories
	// Modo simple (legado): props.seriesData = [{ name, value, color }]
	const isMultiSeries = Array.isArray(props.series)

	const categories = isMultiSeries
		? props.categories || []
		: (props.seriesData || []).map((item) => item.name)

	const series = isMultiSeries
		? props.series.map((serie) => ({
				name: serie.name,
				color: serie.color || undefined,
				data: serie.data,
			}))
		: [
				{
					name: props.seriesName || 'Valor:',
					colorByPoint: props.randomColors || false,
					color: props.color || false,
					data: (props.seriesData || []).map((item) => {
						return {
							name: item.name,
							y: item.value,
							color: item.color,
							drilldown: item.name,
						}
					}),
				},
			]

	const options = {
		chart: {
			type: 'column',
			backgroundColor: darkMode ? '#373638' : 'white',
		},
		title: {
			text: props.title || 'Grafico de Barra',
			style: {
				color: darkMode ? 'white' : 'black',
			},
		},
		legend: {
			enabled: isMultiSeries && series.length > 1,
			itemStyle: {
				color: darkMode ? 'white' : 'black',
			},
			itemHoverStyle: {
				color: darkMode ? '#ccc' : '#333',
			},
		},
		xAxis: {
			visible: true,
			categories,
			labels: {
				style: {
					color: darkMode ? 'white' : 'black',
				},
			},
		},
		yAxis: {
			title: {
				text: 'Valores',
			},
			visible: true,
			labels: {
				style: {
					color: darkMode ? 'white' : 'black',
				},
			},
		},
		series,
	}

	return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default GrafBarra
