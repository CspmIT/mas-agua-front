import React from 'react'
import EChart from './EChart'

const BooleanChart = ({
    value,
    labelOn = 'Encendido',
    labelOff = 'Apagado',
    colorOn = '#00ff00',
    colorOff = '#444',
}) => {

    const option = {
        xAxis: { show: false, min: 0, max: 1 },
        yAxis: { show: false, min: 0, max: 1 },
        series: [
            {
                type: 'scatter',
                symbol: 'circle',
                symbolSize: 80,
                data: [[0.5, 0.6]],
                itemStyle: {
                    color: value ? colorOn : colorOff,
                    shadowBlur: 20,
                    shadowColor: '#000f00',
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                },
                z: 2,
            },
            // Texto debajo del LED
            {
                type: 'custom',
                renderItem: function (params, api) {
                    return {
                        type: 'text',
                        style: {
                            text: value === undefined ? 'Sin datos' : value ? labelOn : labelOff,
                            x: api.getWidth() / 2,
                            y: api.getHeight() * 0.75,
                            textAlign: 'center',
                            fontSize: 26,
                            fill: '#23262e',
                        },
                    }
                },
                data: [0],
                z: 3,
            },
        ],
    }

    return <EChart config={option} />
}

export default BooleanChart
