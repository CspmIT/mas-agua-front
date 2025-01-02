import EChart from './EChart'

const LineChart = ({ xType, xSeries, yType, ySeries }) => {
    const options = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ySeries.map((serie) => serie.name),
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        // toolbox: {
        //     feature: {
        //         saveAsImage: {},
        //     },
        // },
        xAxis: {
            type: xType,
            data: xSeries,
            // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: yType,
        },
        series: ySeries
    }

    return <EChart config={options} />
}

export default LineChart
