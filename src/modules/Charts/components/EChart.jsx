import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const EChart = ({ config, onZoomRange, onRestore }) => {
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = echarts.init(containerRef.current, null, {
      renderer: 'canvas',
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose()
        chartRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current || !config) return

    chartRef.current.setOption(config, {
      notMerge: false,
      lazyUpdate: true,
    })
  }, [config])

  // zoom listener
  useEffect(() => {
    if (!chartRef.current) return
    if (!onZoomRange) return

    const chart = chartRef.current

    const handler = (event) => {
      const batch = event?.batch?.[0]
      if (!batch) return

      const startValue = batch.startValue
      const endValue = batch.endValue

      if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) return
      if (endValue <= startValue) return

      onZoomRange({ startMs: startValue, endMs: endValue })
    }

    chart.on('dataZoom', handler)

    return () => {
      chart.off('dataZoom', handler)
    }
  }, [onZoomRange])

  // ✅ restore listener (toolbox restore)
  useEffect(() => {
    if (!chartRef.current) return
    if (!onRestore) return

    const chart = chartRef.current

    const handler = () => {
      onRestore()
    }

    chart.on('restore', handler)

    return () => {
      chart.off('restore', handler)
    }
  }, [onRestore])

  useEffect(() => {
    if (!chartRef.current) return

    const handleResize = () => {
      chartRef.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  )
}

export default EChart
