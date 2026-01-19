import EChart from './EChart'
import 'echarts-liquidfill'

const SHAPE_CONFIG = {
  circle: {
    radius: '90%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 24,
    outlineDistance: 4,
  },
  rect: {
    radius: '85%',
    radiusMultiple: '90%',
    amplitude: 6,
    waveLength: '90%',
    fontSize: 24,
    outlineDistance: 4,
  },
  roundRect: {
    radius: '90%',
    radiusMultiple: '95%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 24,
    outlineDistance: 4,
  },
  triangle: {
    radius: '80%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 22,
    outlineDistance: 0,
  },
  diamond: {
    radius: '90%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 22,
    outlineDistance: 4,
  },
  arrow: {
    radius: '70%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 18,
    outlineDistance: 4,
  },
  pin: {
    radius: '100%',
    amplitude: 8,
    waveLength: '90%',
    fontSize: 24,
    outlineDistance: 4,
  },
}

const isValidNumber = (v) =>
  v !== null &&
  v !== undefined &&
  v !== '' &&
  !isNaN(Number(v))


const LiquidFillPorcentaje = ({
  multipleValues = null,

  // ─── TU CONTRATO ORIGINAL ───
  value = 0,
  maxValue = 1,
  color = '#38bdf8',
  shape = 'circle',
  porcentage = false,
  border = true,
  unidad = '',
  other = false,
}) => {

  const hasMultiple =
    multipleValues &&
    typeof multipleValues === 'object'

  // ─────────────────────────────────────────────
  // 1) MODO SINGLE – EXACTAMENTE TU ORIGINAL
  // ─────────────────────────────────────────────

  if (!hasMultiple) {

    const hasValue = isValidNumber(value)
    const hasMax = isValidNumber(maxValue)

    const safeValue = hasValue ? Number(value) : null
    const safeMax = hasMax ? Number(maxValue) : 1

    const percentage =
      hasValue && hasMax
        ? Math.max(0, Math.min(1, safeValue / safeMax))
        : 0

    const cfg = SHAPE_CONFIG[shape] ?? SHAPE_CONFIG.circle

    const textColor =
      percentage > 0.6
        ? '#ffffff'
        : '#0f2a44'

    const hasData =
      hasValue &&
      hasMax &&
      safeMax > 0 &&
      percentage > 0

    const options = {
      backgroundColor: 'transparent',

      series: [
        {
          type: 'liquidFill',
          shape,
          radius: cfg.radius,

          // ─── TUS OLITAS CON IDENTIDAD ───
          data: [
            percentage,
          ],

          amplitude: cfg.amplitude,
          waveLength: cfg.waveLength,
          period: hasData ? 4000 : 0,

          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,

              // ─── TU DEGRADE SAGRADO ───
              colorStops: [
                { offset: 0, color: '#a5f3fc' },
                { offset: 0.5, color },
                { offset: 1, color: '#0c4a6e' },
              ],
            },

            // shadowBlur: 30,
            // shadowOffsetY: 10,
            // shadowColor: 'rgba(0,0,0,0.3)',
          },

          label: {
            show: true,

            formatter: (params) => {
              if (!hasValue) {
                return 'Sin datos'
              }

              if (porcentage) {
                return `${(params.value * 100).toFixed(1)} %`
              }

              return `${safeValue.toFixed(2)} ${unidad}${other ? `\n${other}` : ''}`
            },

            fontSize: cfg.fontSize,
            fontWeight: 'bold',

            // ─── TU CONTRASTE INTELIGENTE ───
            color: textColor,

            lineHeight: cfg.fontSize + 6,
            textShadowColor: 'rgba(0,0,0,0.35)',
            textShadowBlur: 6,
          },

          // ─── TU OUTLINE CON GRADIENTE ───
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

              // shadowBlur: 12,
              // shadowColor: 'rgba(0,0,0,0.4)',
            },
          },

          animationEasing: 'cubicOut',
          animationDuration: hasData ? 1800 : 0,
          silent: true,
        },
      ],
    }

    return <EChart config={options} />
  }

  // ─────────────────────────────────────────────
  // 2) MODO MÚLTIPLE – MISMA ESTÉTICA, OTROS TEXTOS
  // ─────────────────────────────────────────────

  const rawMain =
    multipleValues?.value?.value ??
    multipleValues?.value

  const hasMainValue = isValidNumber(rawMain)

  const main = hasMainValue ? Number(rawMain) : null

  const max = parseFloat(
    multipleValues?.maxValue ??
    multipleValues?.maxValue?.value ??
    1
  )


  const secondaryObj = multipleValues?.secondary

  const hasSecondaryInflux =
    secondaryObj &&
    secondaryObj.varsInflux &&
    Object.keys(secondaryObj.varsInflux).length > 0

  const rawSecondary = secondaryObj?.value
  const hasSecondaryValue =
    hasSecondaryInflux && isValidNumber(rawSecondary)


  const cfg = SHAPE_CONFIG[shape] ?? SHAPE_CONFIG.circle

  const percentage =
    hasMainValue && isValidNumber(max)
      ? Math.max(0, Math.min(1, main / max))
      : 0

  const textColor =
    percentage > 0.6
      ? '#ffffff'
      : '#0f2a44'

  const hasData =
    hasMainValue &&
    isValidNumber(max) &&
    max > 0 &&
    percentage > 0

  const options = {
    backgroundColor: 'transparent',

    series: [
      {
        type: 'liquidFill',
        shape,
        radius: cfg.radiusMultiple ? cfg.radiusMultiple : cfg.radius,

        data: [
          percentage,
        ],

        amplitude: cfg.amplitude,
        waveLength: cfg.waveLength,
        period: hasData ? 4000 : 0,

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

          // shadowBlur: 30,
          // shadowOffsetY: 10,
          // shadowColor: 'rgba(0,0,0,0.3)',
        },

        label: {
          show: true,
          fontSize: cfg.fontSize,
          fontWeight: 'bold',
          color: textColor,
          lineHeight: cfg.fontSize + 6,
          textShadowColor: 'rgba(0,0,0,0.35)',
          textShadowBlur: 6,

          rich: {
            main: {
              fontSize: cfg.fontSize,
              fontWeight: 'bold',
              color: textColor,
            },

            sec: {
              fontSize: 20,
              fontWeight: 'bold',
              color: textColor,
            },

            extra: {
              fontSize: 20,
              fontWeight: 'bold',
              color: textColor,
            },
          },

          formatter: () => {

            const lineMain = hasMainValue
              ? porcentage
                ? `${(percentage * 100).toFixed(1)} %`
                : `${main.toFixed(2)} ${unidad}`
              : 'Sin datos'

            let result = `{main|${lineMain}}`

            if (hasSecondaryInflux) {
              const lineSec = hasSecondaryValue
                ? `${Number(rawSecondary).toFixed(2)} ${secondaryObj.unit ?? ''}`
                : 'Sin datos'

              result += `\n{sec|${lineSec}}`
            }

            return result
          }
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

              // ─── TU MISMO GRADIENTE DE OUTLINE ───
              colorStops: [
                { offset: 0, color: '#93c5fd' },
                { offset: 1, color: '#1e3a8a' },
              ],
            },

            // shadowBlur: 5,
            // shadowColor: 'rgba(0,0,0,0.4)',
          },
        },

        silent: true,
        animationEasing: 'cubicOut',
        animationDuration: hasData ? 1800 : 0,
      },
    ],
  }

  return <EChart config={options} />
}

export default LiquidFillPorcentaje