import EChart from './EChart'

const GaugeSpeed = ({
    value,
    maxValue,
    color = '#5c5ac7',
    unidad = '',
    description = '',
    description2 = '',
}) => {
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
                max: maxValue,

                // 🟦 Progreso con volumen
                progress: {
                    show: true,
                    width: 22,
                    roundCap: true,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#c7d2fe' },
                                { offset: 0.5, color: color },
                                { offset: 1, color: '#312e81' },
                            ],
                        },
                        shadowBlur: 8,
                        shadowOffsetY: 3,
                        shadowColor: 'rgba(0,0,0,0.4)',
                    },
                },

                // 🛞 Anillo trasero
                axisLine: {
                    lineStyle: {
                        width: 22,
                        color: [[1, '#657EB333']],
                        // shadowBlur: 15,
                        // shadowColor: 'rgba(0,0,0,0.5)',
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
                        borderColor: color,
                        // shadowBlur: 10,
                        // shadowColor: 'rgba(0,0,0,0.6)',
                    },
                },

                // 🎯 Aguja mecánica
                pointer: {
                    show: true,
                    length: '65%',
                    width: 6,
                    itemStyle: {
                        color: color,
                        // shadowBlur: 10,
                        // shadowColor: 'rgba(0,0,0,0.6)',
                    },
                },

                // 🔤 Texto inferior
                title: {
                    offsetCenter: [0, '95%'],
                    fontSize: 16,
                    color: '#374151',
                },

                detail: {
                    valueAnimation: false,
                    offsetCenter: [0, '78%'],
                    formatter: (val) =>
                        `{value|${Number(val).toFixed(2)} ${unidad}}\n{sub|${description}}`,
                    rich: {
                        value: {
                            fontSize: 26,
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
                        value,
                        name: description2,
                    },
                ],
            },
        ],
    }

    return <EChart config={options} />
}

export default GaugeSpeed
