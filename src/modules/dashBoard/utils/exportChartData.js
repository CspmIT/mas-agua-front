import { mkConfig, generateCsv, download } from 'export-to-csv'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import {
  isEmptyValue,
  formatMsToDateTime,
} from '../../Charts/components/LineChart'

const buildFilename = (chartName) => {
  const base =
    (chartName || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'grafico'

  return `${base}_${dayjs().format('YYYY-MM-DD_HHmm')}`
}

// Misma estructura que la "Tabla de datos" del gráfico: Fecha + una columna por serie
const buildTable = (chartData) => {
  const xSeries = chartData?.xSeries || []
  const ySeries = chartData?.ySeries || []

  const headers = [
    'Fecha',
    ...ySeries.map((s) =>
      s.idVar?.unit ? `${s.name} (${s.idVar.unit})` : s.name
    ),
  ]

  const rows = xSeries.map((t, i) => [
    formatMsToDateTime(t),
    ...ySeries.map((s) => (isEmptyValue(s.data?.[i]) ? null : s.data[i])),
  ])

  return { headers, rows }
}

export const hasExportableData = (chartData) =>
  Boolean(chartData?.xSeries?.length && chartData?.ySeries?.length)

export const exportChartToCsv = (chartData, chartName) => {
  const { headers, rows } = buildTable(chartData)

  const csvConfig = mkConfig({
    filename: buildFilename(chartName),
    fieldSeparator: ',',
    decimalSeparator: '.',
    columnHeaders: headers.map((h, i) => ({
      key: `col${i}`,
      displayLabel: h,
    })),
  })

  const data = rows.map((row) =>
    Object.fromEntries(row.map((v, i) => [`col${i}`, v ?? '']))
  )

  download(csvConfig)(generateCsv(csvConfig)(data))
}

export const exportChartToXlsx = (chartData, chartName) => {
  const { headers, rows } = buildTable(chartData)

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  worksheet['!cols'] = headers.map((h, i) => ({
    wch: i === 0 ? 22 : Math.max(h.length + 2, 12),
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  XLSX.writeFile(workbook, `${buildFilename(chartName)}.xlsx`)
}

export const exportChartToMd = (chartData, chartName) => {
  const { headers, rows } = buildTable(chartData)

  const escapeCell = (v) => String(v).replace(/\|/g, '\\|')
  const line = (cells) => `| ${cells.map(escapeCell).join(' | ')} |`

  const md = [
    line(headers),
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => line(row.map((v) => (v === null ? 'Sin datos' : v)))),
  ].join('\n')

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${buildFilename(chartName)}.md`
  a.click()
  URL.revokeObjectURL(url)
}
