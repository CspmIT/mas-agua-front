import React from 'react'
import EChart from './EChart'
import useChartScale from '../../../hooks/useChartScale'

const BooleanChart = ({
  value,
  textOn = 'Encendido',
  textOff = 'Apagado',
  colorOn = '#00ff00',
  colorOff = '#444',
}) => {

  const { ref, k, kSoft } = useChartScale()

  const hasValue = value !== 'Sin datos'

  const option = {
    xAxis: { show: false, min: 0, max: 1 },
    yAxis: { show: false, min: 0, max: 1 },

    series: [
      // 🟢 LED principal
      {
        type: 'scatter',
        symbol: 'circle',
        symbolSize: Math.round(65 * k),
        data: [[0.5, 0.55]],
        itemStyle: {
          color: !hasValue
            ? {
                type: 'radial',
                x: 0.4,
                y: 0.4,
                r: 0.8,
                colorStops: [
                  { offset: 0, color: '#e5e7eb' },
                  { offset: 1, color: '#6b7280' },
                ],
              }
            : value
              ? {
                  type: 'radial',
                  x: 0.35,
                  y: 0.35,
                  r: 0.8,
                  colorStops: [
                    { offset: 0, color: '#d1fae5' },
                    { offset: 0.4, color: colorOn },
                    { offset: 1, color: '#065f46' },
                  ],
                }
              : {
                  type: 'radial',
                  x: 0.4,
                  y: 0.4,
                  r: 0.8,
                  colorStops: [
                    { offset: 0, color: '#9ca3af' },
                    { offset: 1, color: '#1f2937' },
                  ],
                },

          shadowBlur: !hasValue ? 8 : value ? Math.round(35 * k) : 10,
          shadowColor: value ? colorOn : '#000',
        },
        z: 3,
      },

      // 🔘 Aro exterior
      {
        type: 'scatter',
        symbol: 'circle',
        symbolSize: Math.round(80 * k),
        data: [[0.5, 0.55]],
        itemStyle: {
          color: 'transparent',
          borderColor: '#1f2937',
          borderWidth: Math.max(3, Math.round(6 * k)),
          shadowBlur: 15,
          shadowColor: 'rgba(0,0,0,0.6)',
        },
        z: 2,
      },

      // 🔤 Texto de estado
      {
        type: 'custom',
        renderItem: function (params, api) {
          return {
            type: 'text',
            style: {
              text: !hasValue
                ? 'Sin datos'
                : value
                  ? textOn
                  : textOff,
              x: api.getWidth() / 2,
              y: api.getHeight() * 0.82,
              textAlign: 'center',
              fontSize: Math.round(18 * kSoft),
              fontWeight: 600,
              fill: !hasValue
                ? '#6b7280'
                : value
                  ? '#065f46'
                  : '#374151',
            },
          }
        },
        data: [0],
        z: 4,
      },
    ],
  }

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <EChart config={option} />
    </div>
  )
}

export default BooleanChart
