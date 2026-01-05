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
            // 🟢 LED principal (3D)
            {
                type: 'scatter',
                symbol: 'circle',
                symbolSize: 110,
                data: [[0.5, 0.55]],
                itemStyle: {
                    color: value
                        ? {
                            type: 'radial',
                            x: 0.35,
                            y: 0.35,
                            r: 0.8,
                            colorStops: [
                                { offset: 0, color: '#d1fae5' },
                                { offset: 0.4, color: colorOn },
                                { offset: 1, color: '#065f46' },
                            ],
                        }
                        : {
                            type: 'radial',
                            x: 0.4,
                            y: 0.4,
                            r: 0.8,
                            colorStops: [
                                { offset: 0, color: '#9ca3af' },
                                { offset: 1, color: '#1f2937' },
                            ],
                        },

                    shadowBlur: value ? 35 : 10,
                    shadowColor: value ? colorOn : '#000',
                },
                z: 3,
            },

            // 🔘 Aro exterior (carcasa)
            {
                type: 'scatter',
                symbol: 'circle',
                symbolSize: 130,
                data: [[0.5, 0.55]],
                itemStyle: {
                    color: 'transparent',
                    borderColor: '#1f2937',
                    borderWidth: 6,
                    shadowBlur: 15,
                    shadowColor: 'rgba(0,0,0,0.6)',
                },
                z: 2,
            },

            // 🔤 Texto de estado
            {
                type: 'custom',
                renderItem: function (params, api) {
                    return {
                        type: 'text',
                        style: {
                            text:
                                value === undefined
                                    ? 'Sin datos'
                                    : value
                                        ? labelOn
                                        : labelOff,
                            x: api.getWidth() / 2,
                            y: api.getHeight() * 0.82,
                            textAlign: 'center',
                            fontSize: 20,
                            fontWeight: 600,
                            fill:
                                value === undefined
                                    ? '#9ca3af'
                                    : value
                                        ? '#065f46'
                                        : '#374151',
                        },
                    }
                },
                data: [0],
                z: 4,
            },
        ],
    }


    return <EChart config={option} />
}

export default BooleanChart
