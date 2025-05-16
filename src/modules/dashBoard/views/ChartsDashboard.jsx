import { useEffect, useState } from 'react'
import LoaderComponent from '../../../components/Loader'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import ChartAcorddion from '../components/ChartAcorddion'

const ChartsDashboard = () => {
    const [loaderCooptech, setLoaderCooptech] = useState(true)
    const [charts, setCharts] = useState()


    const fetchSeriesCharts = async () => {
        const url = `${backend[import.meta.env.VITE_APP_NAME]}/dashboardCharts`

        const { data } = await request(url, 'GET')
        setCharts(data)
        setLoaderCooptech(false)
    }

    useEffect(() => {
        fetchSeriesCharts()
    }, [])

    if (loaderCooptech) {
        return (
            <div className="w-full">
                <LoaderComponent />
            </div>
        )
    }

    return (
        <div className="w-full">
            {charts.map((chart) => (
                <ChartAcorddion chart={chart} key={chart.id}/>
            ))}
        </div>
    )
}

export default ChartsDashboard
