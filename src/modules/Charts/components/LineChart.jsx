import { memo, useMemo } from 'react'
import EChart from './EChart'

const LineChart = memo(({ xType, xSeries, yType, ySeries }) => {

    const isMobile = useMemo(
        () => window.matchMedia('(max-width: 768px)').matches,
        []
    )

    const memoizedXSeries = useMemo(() => [...xSeries], [xSeries])

    const memoizedYSeries = useMemo(() => {
        return ySeries.map(series => ({
            ...series,
            data: [...series.data],
            ...(series.areaStyle && {
                areaStyle: {
                    opacity: 0.15
                }
            })
        }))
    }, [ySeries])

    const maxLabels = 24
    const interval = Math.ceil(memoizedXSeries.length / maxLabels)
    const options = useMemo(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                if (!params?.length) return ''

                // título (time)
                const title = params[0]?.axisValueLabel ?? params[0]?.axisValue ?? ''
                let html = `<div style="font-weight:600;margin-bottom:4px;">${title}</div>`

                params.forEach((p) => {
                    const rawValue = p.data

                    const valueText =
                        rawValue === null || rawValue === undefined || rawValue === '-' || Number.isNaN(rawValue)
                            ? 'Sin datos'
                            : rawValue

                    html += `
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};"></span>
                    <span>${p.seriesName}:</span>
                    <b>${valueText}</b>
                  </div>
                `
                })

                return html
            },
        },
        legend: {
            data: memoizedYSeries.map(serie => serie.name),
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        toolbox: {
            feature: {
                dataZoom: { yAxisIndex: 'none' },
            },
        },
        xAxis: {
            type: xType,
            data: memoizedXSeries,
            splitNumber: 5,
            axisLabel: {
                show: !isMobile,
                interval: interval,
                rotate: 25,
                showMinLabel: false
            },
            axisTick: {
                show: !isMobile,
            }
        },
        yAxis: {
            type: yType,
        },
        series: memoizedYSeries.map((s) => ({
            ...s,
            type: 'line',
            connectNulls: true,
            showSymbol: true,
            showAllSymbol: true,
            symbolSize: 2,
            sampling: 'none',
        }))
    }), [xType, memoizedXSeries, yType, memoizedYSeries])

    return <EChart config={options} />
})

export default LineChart
