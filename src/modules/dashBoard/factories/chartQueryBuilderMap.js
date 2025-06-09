import { LineChartRepository } from '../../../class/LineChart'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

export const chartQueryBuilderMap = {
    LineChart: async (chart, filters) => {
        const basicChart = {
            id: chart.id,
            type: chart.type,
            title: chart.name,
        }

        const lineChart = new LineChartRepository(
            basicChart,
            chart.ChartSeriesData,
            chart.ChartConfig
        )

        const query = lineChart.generateQuery(filters)
        const { data } = await request(
            `${backend['Mas Agua']}/seriesDataInflux`,
            'POST',
            query
        )

        const referenceSeries = Object.keys(data).find(
            (key) => data[key].length > 0
        )

        const xSeries = referenceSeries
            ? data[referenceSeries].map((item) => item.time)
            : []

        const ySeries = lineChart.getYSeries().map((series) => ({
            ...series,
            data:
                data[series.idVar.id]?.map((point) => {
                    const value = point.value
                    if (typeof value === 'boolean') {
                        return value ? 1 : 0
                    }
                    if (
                        value !== null &&
                        value !== undefined &&
                        !isNaN(value)
                    ) {
                        return parseFloat(value).toFixed(3)
                    }
                    return '-'
                }) || [],
        }))

        return { xSeries, ySeries }
    },

    PieChart: async (chart) => {
        const updatedPies = await Promise.all(
            chart.ChartPieData.map(async (item) => {
                const { data } = await request(
                    `${backend['Mas Agua']}/dataInflux`,
                    'POST',
                    item?.InfluxVars?.varsInflux
                )
                const accessKey = Object.values(
                    item.InfluxVars.varsInflux
                ).shift()
                return {
                    value: data?.[accessKey.calc_field]?.value,
                    itemStyle: { color: item.color },
                    name: item.name,
                }
            })
        )
        return updatedPies
    },
}
