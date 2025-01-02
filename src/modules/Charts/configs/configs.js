// 0 No requerido, 1 Requerido, 2 Opcional,
export const configs = {
    1: {
        // Porcentaje con olas
        typeGraph: 'LiquidFillPorcentaje',
        title: 1,
        value: 1,
        maxValue: 1,
        unity: 2,
        color: 2,
        singleValue: true,
        preConfig: {
            value: undefined,
            maxValue: undefined,
            color: '#363F9C',
            porcentage: false,
            unidad: undefined,
            type: 'circle',
            border: true,
        },
    },
    // value, maxValue, color, type, porcentage = false, border = true, name = '' -> Valores de LiquidFillPorcentaje
    2: {
        // Circulo con porcentaje
        typeGraph: 'CirclePorcentaje',
        title: 1,
        value: 1,
        maxValue: 1,
        unity: 0,
        color: 2,
        singleValue: true,
    },
    3: {
        // Grafico de torta
        typeGraph: 'DoughnutChart',
        //! Terminar de armar configuracion
        singleValue: false,
    },
    4: {
        //Rectangulo con porcentaje
        typeGraph: 'LiquidFill',
        type: 'rectCircle',
        title: 1,
        value: 1,
        maxValue: 1,
        unity: 2,
        singleValue: true,
    },
    5: {
        // Grafico de barras
        typeGraph: 'BarDataSet',
        //! Terminar de armar configuracion
    },
    6: {
        // Grafico de linea con superposicion
        typeGraph: 'LineChart',
        title: 1,
        xType: 1,
        xSeries: 1,
        yType: 1,
        ySeries: 1,
        singleValue: false,
    },
}
