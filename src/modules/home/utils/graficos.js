export const chartData = [
    {
        title: 'Ingreso de Agua por Hora',
        component: LiquidFill,
        props: {},
        data: {
            value: 1.65,
            maxValue: 5,
            unidad: 'm3',
        },
    },
    {
        title: 'Cantidad de Cloro T1(%)',
        component: LiquidFill,
        props: {
            type: 'circle',
            porcentage: true,
            color: '#FFEB59',
        },
        data: {
            value: 0.65,
            maxValue: 1,
        },
    },
    {
        title: 'Cantidad de Cloro T2 (%)',
        component: LiquidFill,
        props: {
            porcentage: true,
            color: '#FFEB59',
        },
        data: {
            value: 0.63,
            maxValue: 2,
        },
    },
    {
        title: 'Cloro libre',
        component: LiquidFill,
        props: {
            color: '#eefd01',
        },
        data: {
            value: 3.65,
            unidad: 'mg/L',
            maxValue: 10,
        },
    },
    {
        title: 'Nivel de Cisterna (%)',
        component: LiquidFill,
        props: {
            color: '#FFEB59',
            porcentage: true,
            type: 'rectCircle',
            border: false,
        },
        data: {
            value: 2.65,
            maxValue: 5,
        },
    },
    {
        title: 'Nivel de Tanque (%)',
        component: CirclePorcentaje,
        data: {
            value: 6.23,
            maxValue: 10,
        },
        props: {},
    },
    {
        title: 'Grafico de barras',
        component: BarDataSet,
        props: {},
    },
    {
        title: 'Grafico de area',
        component: StackedAreaChart,
        props: {},
    },
    {
        title: 'Grafico de torta',
        component: DoughnutChart,
        props: {},
    },
    {
        title: 'Grafico de linea con superposicion',
        component: LineChart,
        props: {
            xType: 'category',
            xSeries: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'],
            yType: 'value',
            ySeries: [
                { name: 'T1', type: 'line', data: [120, 132, 101, 134, 90] },
                { name: 'T2', type: 'line', data: [220, 182, 191, 234, 290] },
                { name: 'T3', type: 'line', data: [150, 232, 201, 154, 190] },
                {
                    name: 'DeadLine',
                    type: 'line',
                    data: [320, 332, 301, 334, 390],
                },
            ],
        },
    },
]
