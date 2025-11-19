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
        series: [
            {
                type: 'gauge',
                center: ['50%', '50%'],
                startAngle: 210,
                endAngle: -30,
                radius: '95%',
                min: 0,
                max: maxValue,
                progress: {
                    show: true,
                    width: 18,
                    itemStyle: {
                        color: color,
                    },
                },
                axisLine: {
                    lineStyle: {
                        width: 18,
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    length: 10,
                    lineStyle: {
                        width: 2,
                        color: '#999',
                    },
                },
                axisLabel: {
                    distance: 25,
                    color: '#999',
                    fontSize: 12,
                },
                anchor: {
                    show: true,
                    showAbove: true,
                    size: 25,
                    itemStyle: {
                        borderWidth: 10,
                        borderColor: color,
                    },
                },
                title: {
                    offsetCenter: [0, '95%'],
                    show: true,
                    fontSize: 22,
                },
                detail: {
                    valueAnimation: false,
                    offsetCenter: [0, '80%'],
                    formatter: function (value) {
                        return `{value|${value} ${unidad}}\n{sub|${description}}`
                    },
                    rich: {
                        value: {
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: '#333',
                        },
                        sub: {
                            fontSize: 26,
                            color: '#666',
                        },
                    },
                },
                pointer: {
                    show: true,
                    itemStyle: {
                        color: color,
                    },
                },
                data: [
                    {
                        value: value,
                        name: description2,
                    },
                ],
            },
        ],
    }
    return <EChart config={options} />
}

export default GaugeSpeed
