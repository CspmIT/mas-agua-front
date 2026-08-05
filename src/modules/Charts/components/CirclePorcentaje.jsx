import EChart from './EChart'
import useChartScale from '../../../hooks/useChartScale'

const isValidNumber = (v) =>
    v !== null &&
    v !== undefined &&
    v !== '' &&
    !isNaN(Number(v))

const CirclePorcentaje = ({ value = 0, maxValue = 100, color = '#00FF00' }) => {
    const { ref, k, kSoft } = useChartScale()

    const hasValue = isValidNumber(value)
    const hasMax = isValidNumber(maxValue)

    const safeValue = hasValue ? Number(value) : 0
    const safeMax = hasMax ? Number(maxValue) : 1

    const percentage =
        hasValue && hasMax
            ? Number(((safeValue / safeMax) * 100).toFixed(2))
            : 0

    const options = {
        backgroundColor: 'transparent',
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                radius: '90%',

                pointer: { show: false },

                // 🟦 Progreso con volumen
                progress: {
                    show: true,
                    roundCap: true,
                    width: Math.round(24 * k),
                    itemStyle: {
                        color: hasValue
                            ? {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 1,
                                y2: 1,
                                colorStops: [
                                    { offset: 0, color: '#bbf7d0' },
                                    { offset: 0.5, color },
                                    { offset: 1, color: '#064e3b' },
                                ],
                            }
                            : '#cbd5e1', // gris cuando no hay datos
                    },
                },

                // 🛞 Anillo de fondo
                axisLine: {
                    lineStyle: {
                        width: Math.round(24 * k),
                        color: [[1, '#657EB333']],
                        shadowBlur: 12,
                        shadowColor: 'rgba(0,0,0,0.4)',
                    },
                },

                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },

                data: [{ value: percentage }],

                // 🔤 Texto central
                detail: {
                    offsetCenter: [0, '0%'],
                    fontSize: Math.round(24 * kSoft),
                    fontWeight: 700,
                    lineHeight: Math.round(32 * kSoft),
                    color: '#0f2a44',
                    formatter: () =>
                        hasValue
                            ? `${percentage} %`
                            : 'Sin datos',
                    textShadowColor: 'rgba(0,0,0,0.25)',
                    textShadowBlur: 4,
                },
            },
        ],
    }


    return (
        <div ref={ref} style={{ width: '100%', height: '100%' }}>
            <EChart config={options} />
        </div>
    )
}

export default CirclePorcentaje
