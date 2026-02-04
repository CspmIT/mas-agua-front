import LineChart from '../../Charts/components/LineChart'
import DoughnutChart from '../../Charts/components/DoughnutChart'
import LoaderComponent from '../../../components/Loader'

const chartComponentMap = {
  LineChart: ({ chartData, onZoomRange, onRestore }) => (
    <div className="h-[50dvh] 2xl:h-[55dvh] w-full">
      <LineChart
        yType="value"
        xSeries={chartData?.xSeries || []}
        ySeries={chartData?.ySeries || []}
        onZoomRange={onZoomRange}
        onRestore={onRestore}
      />
    </div>
  ),

  PieChart: ({ chartData }) => (
    <div className="h-80 w-full">
      <DoughnutChart data={chartData} />
    </div>
  ),
}

export const ChartFactory = ({ type, chartData, chart, loader, onZoomRange, onRestore  }) => {
  if (loader) return <LoaderComponent />

  const ChartComponent = chartComponentMap[type]

  if (!ChartComponent) {
    return <div>Tipo de gráfico no soportado: {type}</div>
  }

  return <ChartComponent chartData={chartData} chart={chart} onZoomRange={onZoomRange} onRestore={onRestore} />
}
