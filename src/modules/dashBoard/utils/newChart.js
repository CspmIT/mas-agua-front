// Un gráfico se considera "nuevo" durante los primeros 7 días desde su creación
const NEW_CHART_DAYS = 7

export const isNewChart = (chart) => {
    if (!chart?.createdAt) return false
    const created = new Date(chart.createdAt).getTime()
    if (!Number.isFinite(created)) return false
    return Date.now() - created < NEW_CHART_DAYS * 24 * 60 * 60 * 1000
}
