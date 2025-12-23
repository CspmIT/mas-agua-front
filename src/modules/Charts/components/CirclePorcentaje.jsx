import EChart from './EChart'

const CirclePorcentaje = ({ value = 0, maxValue = 100, color = '#00FF00' }) => {
    const percentage = ((value / maxValue) * 100).toFixed(2)

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
                    width: 24,
                    itemStyle: {
                        color: {
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
                        },
                        // shadowBlur: 20,
                        // shadowOffsetY: 6,
                        // shadowColor: 'rgba(0,0,0,0.45)',
                    },
                },

                // 🛞 Anillo de fondo
                axisLine: {
                    lineStyle: {
                        width: 24,
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
                    offsetCenter: [0, '0%'],   // centro exacto
                    fontSize: 26,
                    fontWeight: 700,
                    lineHeight: 32,
                    color: '#0f2a44',
                    formatter: '{value} %',
                    textShadowColor: 'rgba(0,0,0,0.25)',
                    textShadowBlur: 4,
                }
            },
        ],
    }


    return <EChart config={options} />
}

export default CirclePorcentaje
