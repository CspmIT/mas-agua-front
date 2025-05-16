import React from 'react'
import EChart from './EChart'

const DoughnutChart = ({ data }) => {
    const options = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'horizontal',
            left: 'center',
        },
        series: [
            {
                name: 'Categorías',
                type: 'pie',
                radius: ['0%', '70%'],
                data: data ? data : [],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    }

    return <EChart config={options} />
}

export default DoughnutChart
