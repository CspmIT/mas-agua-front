// Preconfig: porcentaje: 1 = porcentaje, 2 = valor
// 0 No requerido, 1 Requerido, 2 Opcional,
export const configs = {
    // LiquidFill,
    // CirclePorcentaje,
    // BarDataSet,
    // DoughnutChart,
    // LineChart,
    1: {
        // Porcentaje con olas
        id: 1,
        typeGraph: 'LiquidFillPorcentaje',
        format: true,
        typeValue: true,
        typeBorder: true,
        typeUnity: true,
        selectColor: true,
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
            porcentage: true,
            unidad: undefined,
            shape: 'circle',
            border: true,
        },
    },
    // value, maxValue, color, type, porcentage = false, border = true, name = '' -> Valores de LiquidFillPorcentaje
    2: {
        // Circulo con porcentaje
        id: 2,
        typeGraph: 'CirclePorcentaje',
        format: false,
        typeValue: false,
        typeBorder: false,
        title: 1,
        value: 1,
        maxValue: 1,
        unity: 0,
        color: 2,
        singleValue: true,
        preConfig: {
            value: undefined,
            maxValue: undefined,
            color: '#363F9C',
        },
    },
    3: {
        // Grafico de torta
        id: 3,
        typeGraph: 'DoughnutChart',
        //! Terminar de armar configuracion
        singleValue: false,
        format: false,
    },
    4: {
        //Rectangulo con porcentaje
        id: 4,
        typeGraph: 'LiquidFillPorcentaje',
        format: true,
        typeValue: true,
        typeBorder: true,
        typeUnity: true,
        selectColor: true,
        title: 1,
        value: 1,
        maxValue: 1,
        unity: 2,
        singleValue: true,
        preConfig: {
            value: undefined,
            maxValue: undefined,
            color: '#363F9C',
            porcentage: false,
            unidad: undefined,
            shape: 'rect',
            border: false,
            // other: 'Otro texto reenderizado',
        },
    },
    5: {
        // Grafico de barras
        id: 5,
        typeGraph: 'BarDataSet',
        //! Terminar de armar configuracion
    },
    6: {
        // Grafico de linea con superposicion
        id: 6,
        typeGraph: 'LineChart',
        title: 1,
        format: true,
        xType: 1,
        xSeries: 1,
        yType: 1,
        ySeries: 1,
        singleValue: false,
    },
}
