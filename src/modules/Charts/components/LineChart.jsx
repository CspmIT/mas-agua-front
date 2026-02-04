import { memo, useMemo, useCallback } from 'react'
import EChart from './EChart'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

const isEmptyValue = (v) =>
  v === null || v === undefined || v === '-' || Number.isNaN(v)

const formatMsToDateTime = (ms) => {
  if (!Number.isFinite(ms)) return '-'
  return new Date(ms).toLocaleString('es-AR', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatMsAxisLabel = (ms) => {
  if (!Number.isFinite(ms)) return '-'

  const d = new Date(ms)

  const date = d.toLocaleDateString('es-AR', { timeZone: TIMEZONE })
  const time = d.toLocaleTimeString('es-AR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return `${time}\n${date}`
}

const buildTooltipHtml = (params) => {
  if (!params?.length) return ''

  const timeMs = params[0]?.value?.[0]
  const title = formatMsToDateTime(timeMs)

  let html = `<div style="font-weight:600;margin-bottom:4px;">${title}</div>`

  params.forEach((p) => {
    const rawValue = p?.value?.[1]
    const valueText = isEmptyValue(rawValue) ? 'Sin datos' : rawValue

    html += `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};"></span>
        <span>${p.seriesName}:</span>
        <b>${valueText}</b>
      </div>
    `
  })

  return html
}

const buildDataViewTableHtml = (opt) => {
  const series = opt?.series || []
  if (!series.length) return `<div style="padding:12px;">Sin datos</div>`

  const baseData = series[0]?.data || []

  let html = `
    <div style="padding:5px;max-height:60vh;font-family:Arial;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">Fecha</th>
  `

  series.forEach((s) => {
    html += `<th style="text-align:left;border-bottom:1px solid #ddd;padding:6px;">${s.name}</th>`
  })

  html += `
          </tr>
        </thead>
        <tbody>
  `

  for (let i = 0; i < baseData.length; i++) {
    const rowTime = baseData[i]?.[0]

    html += `<tr>`
    html += `<td style="border-bottom:1px solid #eee;padding:6px;white-space:nowrap;">${formatMsToDateTime(
      rowTime
    )}</td>`

    series.forEach((s) => {
      const v = s.data?.[i]?.[1]
      const valueText = isEmptyValue(v) ? 'Sin datos' : v
      html += `<td style="border-bottom:1px solid #eee;padding:6px;">${valueText}</td>`
    })

    html += `</tr>`
  }

  html += `
        </tbody>
      </table>
    </div>
  `

  return html
}

const LineChart = memo(({ yType, xSeries, ySeries, onZoomRange, onRestore }) => {
  const isMobile = useMemo(
    () => window.matchMedia('(max-width: 768px)').matches,
    []
  )

  const memoizedXSeries = useMemo(() => [...(xSeries || [])], [xSeries])

  // ySeries => formato [timeMs, value]
  const memoizedYSeries = useMemo(() => {
    return (ySeries || []).map((series) => {
      const data = (series.data || []).map((v, i) => {
        const t = memoizedXSeries[i]
        return [t, v]
      })

      return {
        ...series,
        type: 'line',
        data,
        connectNulls: true,
        showSymbol: true,
        showAllSymbol: 'auto',
        symbolSize: 2,
        sampling: 'none',
        ...(series.areaStyle && { areaStyle: { opacity: 0.15 } }),
      }
    })
  }, [ySeries, memoizedXSeries])

  const axisLabelFormatter = useCallback((valueMs) => {
    return formatMsAxisLabel(valueMs)
  }, [])

  const tooltipFormatter = useCallback((params) => {
    return buildTooltipHtml(params)
  }, [])

  const dataViewContent = useCallback((opt) => {
    return buildDataViewTableHtml(opt)
  }, [])

  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        formatter: tooltipFormatter,
      },

      legend: {
        data: memoizedYSeries.map((s) => s.name),
      },

      grid: {
        left: '3%',
        right: '4%',
        top: '8%',
        bottom: isMobile ? '10%' : '6%',
        containLabel: true,
      },

      toolbox: {
        feature: {
          dataZoom: { 
            yAxisIndex: 'none',
           },

          dataView: {
            readOnly: true,
            title: 'Tabla',
            lang: ['Tabla de datos', 'Cerrar'],
            optionToContent: dataViewContent,
          },

          restore: {
            title: 'Restablecer'
          },
          saveAsImage: {
            name: "Gráfico +Agua",
            title: 'Guardar imagen'
          }
        },
      },

      xAxis: {
        type: 'time',
        splitNumber: isMobile ? 4 : 10,
        offset: 5,
        axisLabel: {
          show: !isMobile,
          rotate: 20,
          formatter: axisLabelFormatter,
        },
      },

      yAxis: {
        type: yType || 'value',
        scale: true,
      },

      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          throttle: 80,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: false,
          filterMode: 'none',
          minValueSpan: 2 * 60 * 1000,
          start: 0,
          end: 100,
          moveHandleSize: 12
        },

        {
          type: 'slider',
          xAxisIndex: 0,
          height: 28,
          bottom: 0,
          filterMode: 'none',
          minValueSpan: 2 * 60 * 1000,
          showDetail: true,
          handleSize: 16,
          left: '8%',
          right: '8%',
          showDataShadow: true,
          brushSelect: false,
          labelFormatter: axisLabelFormatter,
          start: 0,
          end: 100,
        },
      ],

      series: memoizedYSeries,
    }
  }, [
    memoizedYSeries,
    yType,
    isMobile,
    tooltipFormatter,
    axisLabelFormatter,
    dataViewContent,
  ])

  return (
    <EChart config={options} onZoomRange={onZoomRange} onRestore={onRestore} />
  )
})

export default LineChart
