import { LineChartRepository } from '../../../class/LineChart'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'

const parseEsArTimeToMs = (timeStr) => {
    if (!timeStr) return NaN

    const clean = timeStr
        .replace(/\u00A0/g, ' ') // NBSP
        .replace(/\s+/g, ' ')
        .trim()

    const [datePartRaw, timePartRaw] = clean.split(',')
    if (!datePartRaw || !timePartRaw) return NaN

    const [d, m, yy] = datePartRaw.trim().split('/').map(Number)
    if (![d, m, yy].every(Number.isFinite)) return NaN

    const timePart = timePartRaw.trim()

    // Acepta: "03:46:00 p. m." | "03:46:00 p.m." | "03:46:00 pm"
    const match = timePart.match(
        /^(\d{1,2}):(\d{2}):(\d{2})\s*([ap])\.?\s*m\.?\.?$/i
    )
    if (!match) return NaN

    let hour = Number(match[1])
    const minute = Number(match[2])
    const second = Number(match[3])
    const ampm = match[4].toLowerCase()

    if (ampm === 'p' && hour < 12) hour += 12
    if (ampm === 'a' && hour === 12) hour = 0

    const fullYear = 2000 + yy
    return new Date(fullYear, m - 1, d, hour, minute, second).getTime()
}

const samplingPeriodToMs = (sp) => {
    if (!sp) return 60 * 1000

    const n = parseInt(sp)
    if (Number.isNaN(n)) return 60 * 1000

    if (sp.includes('ms')) return n
    if (sp.includes('s')) return n * 1000
    if (sp.includes('m')) return n * 60 * 1000
    if (sp.includes('h')) return n * 60 * 60 * 1000

    return 60 * 1000
}

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

        const keys = Object.keys(data || {})
        if (!keys.length) return { xSeries: [], ySeries: [] }

        // 1) Buscar la variable con más registros -> referencia
        const referenceKey = keys.reduce((bestKey, currentKey) => {
            const bestLen = data[bestKey]?.length || 0
            const currentLen = data[currentKey]?.length || 0
            return currentLen > bestLen ? currentKey : bestKey
        }, keys[0])

        const referenceArr = data[referenceKey] || []

        // Helper parse
        const toMs = (timeStr) => parseEsArTimeToMs(timeStr)

        // samplingPeriod desde config / serie / query
        const samplingPeriod =
            chart?.ChartConfig?.samplingPeriod ||
            chart?.ChartSeriesData?.[0]?.samplingPeriod ||
            query?.[0]?.samplingPeriod

        const stepMs = samplingPeriodToMs(samplingPeriod)

        // 2) Generar grilla completa del eje X (en ms) para rellenar huecos
        //    Esto aplica tanto si hay 1 variable como si hay varias.
        let xSeriesMs = []

        if (referenceArr.length >= 2 && stepMs > 0) {
            const start = toMs(referenceArr[0]?.time)
            const end = toMs(referenceArr[referenceArr.length - 1]?.time)

            if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
                for (let t = start; t <= end; t += stepMs) {
                    xSeriesMs.push(t)
                }
            }
        }

        // fallback si no se pudo generar grilla (por parse o por falta de datos)
        if (!xSeriesMs.length) {
            xSeriesMs = referenceArr
                .map((p) => toMs(p?.time))
                .filter((t) => Number.isFinite(t))
        }

        // Formato final del eje X (lo que consume el gráfico)
        const formatter = new Intl.DateTimeFormat('es-AR', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires',
        })

        const xSeries = xSeriesMs.map((t) => formatter.format(new Date(t)))

        // 3) Crear mapas por variable: ms -> value
        const timeValueMaps = {}
        for (const varId of keys) {
            const map = new Map()

            for (const point of data[varId] || []) {
                const t = toMs(point?.time)
                if (Number.isFinite(t)) {
                    map.set(t, point?.value)
                }
            }

            timeValueMaps[varId] = map
        }

        // 4) Alinear ySeries al xSeriesMs y completar faltantes con null
        const ySeries = lineChart.getYSeries().map((series) => {
            const varId = String(series.idVar.id)
            const map = timeValueMaps[varId] || new Map()

            const alignedData = xSeriesMs.map((t) => {
                const value = map.get(t)

                if (typeof value === 'boolean') return value ? 1 : 0

                if (value !== null && value !== undefined && !isNaN(value)) {
                    return Number(parseFloat(value).toFixed(3))
                }

                // faltante => null (así el gráfico corta la línea)
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
