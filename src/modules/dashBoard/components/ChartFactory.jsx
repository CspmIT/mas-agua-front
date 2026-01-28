import LineChart from '../../Charts/components/LineChart'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import LoaderComponent from '../../../components/Loader'

const chartComponentMap = {
    LineChart: ({ chartData }) => (
        <div className="h-[50dvh] 2xl:h-[55dvh] w-full">
            <LineChart
                xType="category"
                yType="value"
                xSeries={chartData?.xSeries || []}
                ySeries={chartData?.ySeries || []}
            />
        </div>
    ),
    PieChart: ({ chartData, chart }) => (
        <div className="h-80 w-full">
            <DoughnutChart data={chartData} />
        </div>
    ),
}

export const ChartFactory = ({ type, chartData, chart, loader }) => {
    if (loader) return <LoaderComponent />

    const ChartComponent = chartComponentMap[type]

    if (!ChartComponent) {
        return <div>Tipo de gráfico no soportado: {type}</div>
    }

    return <ChartComponent chartData={chartData} chart={chart} />
}

