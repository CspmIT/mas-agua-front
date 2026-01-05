import EChart from './EChart'
import 'echarts-liquidfill'

const SHAPE_CONFIG = {
  circle: {
    radius: '85%',
    amplitude: 8,
    waveLength: '80%',
    fontSize: 26,
    outlineDistance: 10,
  },
  rect: {
    radius: '80%',
    amplitude: 6,
    waveLength: '90%',
    fontSize: 26,
    outlineDistance: 6,
  },
  roundRect: {
    radius: '85%',
    amplitude: 6,
    waveLength: '90%',
    fontSize: 26,
    outlineDistance: 8,
  },
  triangle: {
    radius: '80%',
    amplitude: 5,
    waveLength: '95%',
    fontSize: 22,
    outlineDistance: 0,
  },
  diamond: {
    radius: '90%',
    amplitude: 5,
    waveLength: '95%',
    fontSize: 22,
    outlineDistance: 6,
  },
  arrow: {
    radius: '70%',
    amplitude: 4,
    waveLength: '100%',
    fontSize: 18,
    outlineDistance: 5,
  },
  pin: {
    radius: '100%',
    amplitude: 4,
    waveLength: '100%',
    fontSize: 24,
    outlineDistance: 4,
  },
}

const LiquidFillPorcentaje = ({
  value = 0,
  maxValue = 1,
  color = '#38bdf8',
  shape = 'circle',
  porcentage = false,
  border = true,
  unidad = '',
  other = false,
}) => {
  const percentage = Math.max(0, Math.min(1, value / maxValue))
  const cfg = SHAPE_CONFIG[shape] ?? SHAPE_CONFIG.circle

  const textColor = percentage > 0.6 ? '#ffffff' : '#0f2a44'

  const options = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'liquidFill',
        shape,
        radius: cfg.radius,

        data: [
          percentage,
          percentage * 0.98,
          percentage * 0.96,
        ],

        amplitude: cfg.amplitude,
        waveLength: cfg.waveLength,
        period: 4000,

        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#a5f3fc' },
              { offset: 0.5, color },
              { offset: 1, color: '#0c4a6e' },
            ],
          },
          shadowBlur: 30,
          shadowOffsetY: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
        },

        label: {
          show: true,
          formatter: (params) => {
            if (porcentage) {
              return `${(params.value * 100).toFixed(1)} %`
            }
            return `${parseFloat(value).toFixed(2)} ${unidad}${other ? `\n${other}` : ''}`
          },
          fontSize: cfg.fontSize,
          fontWeight: 'bold',
          color: textColor,
          lineHeight: cfg.fontSize + 6,
          textShadowColor: 'rgba(0,0,0,0.35)',
          textShadowBlur: 6,
        },       

        outline: {
          show: border,
          borderDistance: cfg.outlineDistance,
          itemStyle: {
            borderWidth: 8,
            borderColor: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#93c5fd' },
                { offset: 1, color: '#1e3a8a' },
              ],
            },
            shadowBlur: 12,
            shadowColor: 'rgba(0,0,0,0.4)',
          },
        },

        animationEasing: 'cubicOut',
        animationDuration: 1800,
        silent: true,
      },
    ],
  }

  return <EChart config={options} />
}

export default LiquidFillPorcentaje
