export class SeriesChart {
    constructor(chart, series, config) {
        if (!chart) throw new Error('Chart is required.')
        if (!Array.isArray(series) && series.length > 0)
            throw new Error('Series is required.')
        if (!config) throw new Error('Config is required.')

        this.chart = chart
        this.series = series
        this.config = config
    }
}
