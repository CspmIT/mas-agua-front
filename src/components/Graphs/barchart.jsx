import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { MainContext } from '../../context/MainContext'
import { useContext } from 'react'
function GrafBarra({ ...props }) {
	const { darkMode } = useContext(MainContext)
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
			enabled: false,
		},
		xAxis: {
			visible: true,
			categories: props.seriesData.map((item) => item.name),
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
		series: [
			// Pongo las series de datos con meses y valores
			{
				name: props.seriesName || 'Valor:',
				colorByPoint: props.randomColors || false,
				color: props.color || false,
				data: props.seriesData.map((item) => {
					return {
						name: item.name,
						y: item.value,
						color: item.color,
						drilldown: item.name,
					}
				}),
			},
		],
	}

	return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default GrafBarra
