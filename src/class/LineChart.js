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
                areaStyle: serie.areaStyle || null,
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
          
          if (!this.series || this.series.length === 0) return []
          
          const config = this.getConfig()
          const filter = filters[this.chart.id] || {}
      
          return this.series.flatMap((serie) => {
            const influxVars = serie.InfluxVars
            if (!influxVars || !influxVars.varsInflux) return []
            
            const influxVarName = influxVars.name
            const vars = influxVars.varsInflux[influxVarName]
            if (!vars) return []
      
            const samplingPeriod =
              filter.samplingPeriod || config.samplingPeriod || '1h'
      
            let timeConfig = {}
      
            if (filter.type === 'absolute') {
              timeConfig = {
                typePeriod: 'between',
                dateFrom: filter.dateFrom,
                dateTo: filter.dateTo,
              }
            } else {
              timeConfig = {
                typePeriod: 'last',
                dateRange:
                  filter.dateRange || config.dateRange || '-7d',
              }
            }
      
            return {
              varId: serie.source_id, 
              field: vars.calc_field,
              topic: vars.calc_topic,
              name: serie.name,
              type: influxVars.type,
      
              samplingPeriod,
      
              ...timeConfig,
      
              render: true,
              calc: influxVars.calc,
              equation: influxVars.equation,
            }
          })
        } catch (error) {
          throw Error(error)
        }
      }
      
}
