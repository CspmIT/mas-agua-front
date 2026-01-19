import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const EChart = ({ config }) => {
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  // Inicializar UNA sola vez
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

  // Actualizar opciones SIN recrear el chart
  useEffect(() => {
    if (!chartRef.current || !config) return

    chartRef.current.setOption(config, {
      notMerge: false,
      lazyUpdate: true,
    })
  }, [config])

  // Resize optimizado (sin loop)
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
