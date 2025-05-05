import EChart from './EChart'

const CirclePorcentaje = ({ value= 0, maxValue=100, color= '#00FF00' }) => {
    const percentage = ((value / maxValue) * 100).toFixed(2)

    const options = {

        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: {
                    show: false,
                },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: color,
                        color: color,
                    },
                },
                axisLine: {
                    lineStyle: {
                        width: 25,
                    },
                },
                splitLine: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                data: [
                    {
                        value: percentage,
                        title: {
                            offsetCenter: ['0%', '-30%'],
                        },
                        detail: {
                            valueAnimation: false,
                            offsetCenter: ['0%', '0%'],
                        },
                    },
                ],
                title: {
                    fontSize: 22,
                },
                detail: {
                    width: 50,
                    height: 14,
                    fontSize: 24,
                    color: color,
                    formatter: '{value} %',
                },
            },
        ],
    }

    return <EChart config={options} />
}

export default CirclePorcentaje
