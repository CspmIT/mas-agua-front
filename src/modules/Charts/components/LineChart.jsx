import { memo, useMemo } from 'react'
import EChart from './EChart'

const LineChart = memo(({ xType, xSeries, yType, ySeries }) => {
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
                interval: interval,
                rotate: 30,
                showMinLabel: false 
            }
        },
        yAxis: {
            type: yType,
        },
        series: memoizedYSeries
    }), [xType, memoizedXSeries, yType, memoizedYSeries])

    return <EChart config={options} />
})

export default LineChart
