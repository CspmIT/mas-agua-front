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

        // 1) Buscar la variable con más registros -> de ahí sale el eje X
        const referenceKey = Object.keys(data).reduce((bestKey, currentKey) => {
            const bestLen = data[bestKey]?.length || 0
            const currentLen = data[currentKey]?.length || 0
            return currentLen > bestLen ? currentKey : bestKey
        }, Object.keys(data)[0])

        const xSeries = referenceKey
            ? data[referenceKey].map((p) => p.time)
            : []

        // 2) Crear un mapa por variable: time -> value
        const timeValueMaps = {}
        for (const varId of Object.keys(data)) {
            const map = new Map()
            for (const point of data[varId] || []) {
                map.set(point.time, point.value)
            }
            timeValueMaps[varId] = map
        }

        // 3) Armar ySeries alineado al xSeries y completar con null si falta
        const ySeries = lineChart.getYSeries().map((series) => {
            const varId = String(series.idVar.id)
            const map = timeValueMaps[varId] || new Map()

            const alignedData = xSeries.map((time) => {
                const value = map.get(time)

                if (typeof value === 'boolean') return value ? 1 : 0

                if (value !== null && value !== undefined && !isNaN(value)) {
                    return Number(parseFloat(value).toFixed(3))
                }

                // clave: si no hay dato para ese time => null
                return null
            })

            return {
                ...series,
                data: alignedData,
            }
        })

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
