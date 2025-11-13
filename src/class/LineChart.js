import { generarNumerosAleatorios } from '../utils/js/randomNumberGenerator'
import { SeriesChart } from './SeriesChart'

export class LineChartRepository extends SeriesChart {
    getYSeries(random = false) {
        try {
            return this.series.map((serie) => ({
                name: serie.name,
                type: serie.line === 'smooth' ? 'line' : serie.line, // Tipo de gráfico
                data: random ? generarNumerosAleatorios(8) : [],
                idVar: serie.InfluxVars,
                smooth: serie.line === 'smooth',
                color: serie.color,
            }))
        } catch (error) {
            throw Error(error)
        }
    }

    getConfig() {
        try {
            return this.config.reduce((acc, config) => {
                const { key, value, type } = config
                return {
                    ...acc,
                    [key]:
                        type === 'boolean' ? Boolean(parseInt(value)) : value,
                }
            }, {})
        } catch (error) {
            throw Error(error)
        }
    }

    generateQuery(filters = {}) {
        try {
            if (!this.series || this.series.length === 0) return ''

            const config = this.getConfig()

            const queries = this.series.flatMap((serie) => {
                const influxVars = serie.InfluxVars
                if (!influxVars || !influxVars.varsInflux) return []

                const influxVarName = influxVars.name
                const vars = influxVars.varsInflux[influxVarName]
                console.log(influxVars)
                if (!vars) return []

                const dateRange =
                    config.dateTimeType === 'date'
                        ? filters[this.chart.id]?.dateRange || config.dateRange
                        : filters[this.chart.id]?.dateRange || config.timeRange

                const samplingPeriod =
                    filters[this.chart.id]?.samplingPeriod ||
                    config.samplingPeriod

                return {
                    varId: serie.source_id, // parece que acá debería ser el source_id
                    field: vars.calc_field,
                    topic: vars.calc_topic,
                    name: serie.name,
                    dateRange: dateRange || '-7d',
                    samplingPeriod: samplingPeriod || '1h',
                    typePeriod: vars.calc_type_period,
                    render: true,
                    type: 'history',
                    calc: influxVars.calc,
                    equation: influxVars.equation
                }
            })

            return queries
        } catch (error) {
            throw Error(error)
        }
    }
}
