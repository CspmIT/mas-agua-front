import { LineChartRepository } from '../../../class/LineChart'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
const parseEsArTimeToMs = (timeStr) => {
    if (!timeStr) return NaN
  
    const clean = timeStr
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  
    const [datePartRaw, timePartRaw] = clean.split(',')
    if (!datePartRaw || !timePartRaw) return NaN
  
    const [d, m, yy] = datePartRaw.trim().split('/').map(Number)
    if (![d, m, yy].every(Number.isFinite)) return NaN
  
    const timePart = timePartRaw.trim()
  
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
  
      const referenceKey = keys.reduce((bestKey, currentKey) => {
        const bestLen = data[bestKey]?.length || 0
        const currentLen = data[currentKey]?.length || 0
        return currentLen > bestLen ? currentKey : bestKey
      }, keys[0])
  
      const referenceArr = data[referenceKey] || []
  
      const toMs = (timeStr) => parseEsArTimeToMs(timeStr)
  
      const samplingPeriod =
        chart?.ChartConfig?.samplingPeriod ||
        chart?.ChartSeriesData?.[0]?.samplingPeriod ||
        query?.[0]?.samplingPeriod ||
        '5m'
      const stepMs = samplingPeriodToMs(samplingPeriod)
  
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
  
      if (!xSeriesMs.length) {
        xSeriesMs = referenceArr
          .map((p) => toMs(p?.time))
          .filter((t) => Number.isFinite(t))
      }
  
      const timeValueMaps = {}
      for (const varId of keys) {
        const map = new Map()
        for (const point of data[varId] || []) {
          const t = toMs(point?.time)
          if (Number.isFinite(t)) map.set(t, point?.value)
        }
        timeValueMaps[varId] = map
      }
  
      const ySeries = lineChart.getYSeries().map((series) => {
        const varId = String(series.idVar.id)
        const map = timeValueMaps[varId] || new Map()
  
        const alignedData = xSeriesMs.map((t) => {
          const value = map.get(t)
  
          if (typeof value === 'boolean') return value ? 1 : 0
  
          if (value !== null && value !== undefined && !isNaN(value)) {
            return Number(parseFloat(value).toFixed(3))
          }
  
          return null
        })
  
        return {
          ...series,
          data: alignedData,
        }
      })
  
      return { xSeries: xSeriesMs, ySeries }
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
