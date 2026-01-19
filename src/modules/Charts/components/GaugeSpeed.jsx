import EChart from './EChart'

const isValidNumber = (v) =>
  v !== null &&
  v !== undefined &&
  v !== '' &&
  !isNaN(Number(v))

const GaugeSpeed = ({
  value,
  maxValue,
  color = '#5c5ac7',
  unidad = '',
  description = '',
  description2 = '',
}) => {

  const hasValue = isValidNumber(value)
  const hasMax = isValidNumber(maxValue)

  const safeValue = hasValue ? Number(value) : 0
  const safeMax = hasMax ? Number(maxValue) : 1

  const options = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        center: ['50%', '50%'],
        startAngle: 210,
        endAngle: -30,
        radius: '95%',
        min: 0,
        max: safeMax,

        // 🟦 Progreso
        progress: {
          show: true,
          width: 22,
          roundCap: true,
          itemStyle: {
            color: hasValue
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: '#c7d2fe' },
                    { offset: 0.5, color },
                    { offset: 1, color: '#312e81' },
                  ],
                }
              : '#cbd5e1', // gris offline
            // shadowBlur: 8,
            // shadowOffsetY: 3,
            // shadowColor: 'rgba(0,0,0,0.4)',
          },
        },

        // 🛞 Anillo trasero
        axisLine: {
          lineStyle: {
            width: 22,
            color: [[1, '#657EB333']],
          },
        },

        axisTick: { show: false },

        splitLine: {
          length: 10,
          lineStyle: {
            width: 2,
            color: '#9ca3af',
          },
        },

        axisLabel: {
          distance: 25,
          color: '#9ca3af',
          fontSize: 10,
          fontWeight: 450,
        },

        // ⚙️ Buje central
        anchor: {
          show: true,
          showAbove: true,
          size: 26,
          itemStyle: {
            color: '#111827',
            borderWidth: 8,
            borderColor: hasValue ? color : '#9ca3af',
          },
        },

        // 🎯 Aguja
        pointer: {
          length: '65%',
          width: 6,
          itemStyle: {
            color: hasValue ? color : '#9ca3af',
          },
        },

        // 🔤 Texto inferior
        title: {
          offsetCenter: [0, '75%'],
          fontSize: 16,
          color: '#374151',
        },

        detail: {
          valueAnimation: false,
          offsetCenter: [0, '85%'],
          formatter: () =>
            hasValue
              ? `{value|${safeValue.toFixed(2)} ${unidad}}\n{sub|${description}}`
              : `{value|Sin datos}\n{sub|${description}}`,
          rich: {
            value: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#111827',
            },
            sub: {
              fontSize: 22,
              color: '#4b5563',
            },
          },
        },

        data: [
          {
            value: safeValue,
            name: description2,
          },
        ],
      },
    ],
  }

  return <EChart config={options} />
}

export default GaugeSpeed
