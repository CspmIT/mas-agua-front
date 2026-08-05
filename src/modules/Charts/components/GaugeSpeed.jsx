import EChart from './EChart'
import useChartScale from '../../../hooks/useChartScale'

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

  // El arco (210° → -30°) deja libre la franja inferior: el gauge tolera cards
  // más anchas que altas, por eso el alto pesa un poco más que el ancho.
  const { ref, k, kSoft, compact, width, height } = useChartScale({ heightBias: 1.08 })

  const hasValue = isValidNumber(value)
  const hasMax = isValidNumber(maxValue)

  const safeValue = hasValue ? Number(value) : 0
  const safeMax = hasMax ? Number(maxValue) : 1

  const ringWidth = Math.round(22 * k)
  const valueFont = Math.round(22 * kSoft)
  const subFont = Math.max(9, Math.round(18 * k))

  // En compacto el valor se ancla al borde inferior de la card (en px desde el
  // centro del arco, que está al 45% del alto). Si se posicionara como % del
  // radio —que sale del ancho— en cards altas y angostas quedaría pisando el
  // dial. blockH estima el alto del bloque valor + descripción.
  const blockH = valueFont * 1.1 + subFont * 1.25 + 4
  const detailOffsetY =
    compact && height > 0
      ? Math.round(0.55 * height - blockH / 2 - 4)
      : null

  const options = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        // En compacto el arco sube y se achica para que el texto inferior
        // no se corte contra el borde de la card
        center: ['50%', compact ? '45%' : '50%'],
        startAngle: 210,
        endAngle: -30,
        radius: compact ? '88%' : '95%',
        min: 0,
        max: safeMax,
        splitNumber: compact ? 5 : 10,

        // 🟦 Progreso
        progress: {
          show: true,
          width: ringWidth,
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
          },
        },

        // 🛞 Anillo trasero
        axisLine: {
          lineStyle: {
            width: ringWidth,
            color: [[1, '#657EB333']],
          },
        },

        axisTick: { show: false },

        splitLine: {
          length: compact ? 5 : Math.round(10 * k),
          lineStyle: {
            width: compact ? 1 : 2,
            color: '#9ca3af',
          },
        },

        // En modo compacto los números de la escala no entran sin encimarse
        axisLabel: {
          show: !compact,
          distance: Math.round(25 * k),
          color: '#9ca3af',
          fontSize: Math.max(8, Math.round(10 * k)),
          fontWeight: 450,
        },

        // ⚙️ Buje central
        anchor: {
          show: true,
          showAbove: true,
          size: Math.max(10, Math.round(26 * k * 0.85)),
          itemStyle: {
            color: '#111827',
            borderWidth: Math.max(2, Math.round(8 * k * 0.85)),
            borderColor: hasValue ? color : '#9ca3af',
          },
        },

        // 🎯 Aguja
        pointer: {
          length: compact ? '56%' : '65%',
          width: Math.max(3, Math.round(5 * k)),
          itemStyle: {
            color: hasValue ? color : '#9ca3af',
          },
        },

        // 🔤 Texto inferior (en compacto se oculta para no pisar el valor)
        title: {
          show: !compact,
          offsetCenter: [0, '75%'],
          fontSize: Math.max(9, Math.round(16 * k)),
          color: '#374151',
        },

        detail: {
          valueAnimation: false,
          offsetCenter: [0, compact ? detailOffsetY ?? '95%' : '85%'],
          formatter: () =>
            hasValue
              ? `{value|${safeValue} ${unidad}}\n{sub|${description}}`
              : `{value|Sin datos}\n{sub|${description}}`,
          rich: {
            value: {
              fontSize: valueFont,
              fontWeight: 'bold',
              color: '#111827',
              // Interlineado ajustado en compacto: la descripción queda
              // pegada al valor en vez de flotar cerca del borde
              ...(compact && { lineHeight: Math.round(valueFont * 1.1) }),
            },
            sub: {
              fontSize: subFont,
              color: '#4b5563',
              ...(compact && { lineHeight: Math.round(subFont * 1.25) }),
              // La descripción se corta con «…» si no entra en la card
              ...(width > 0 && {
                width: Math.round(width * 0.92),
                overflow: 'truncate',
              }),
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

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      <EChart config={options} />
    </div>
  )
}

export default GaugeSpeed
