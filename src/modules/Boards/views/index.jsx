import React, { useEffect, useRef, useState } from 'react'
import { Grid } from '@mui/material'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import BoardChart from '../../Charts/components/BoardChart'

const Boards = () => {
  const [boards, setBoards] = useState([])
  const [chartsMap, setChartsMap] = useState({})
  const [seriesChartsMap, setSeriesChartsMap] = useState({})
  const [inflValues, setInflValues] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const intervalRef = useRef(null)


  const extractInfluxVars = (charts) => {
    const vars = []

    charts.forEach((chart) => {
      chart.ChartData?.forEach((item) => {
        if (item.InfluxVars) {
          vars.push({ dataInflux: item.InfluxVars })
        }
      })
    })

    return vars
  }

  const getBoards = async () => {
    try {
      const { data } = await request(
        `${backend['Mas Agua']}/indicatorCharts`,
        'GET'
      )

      const boardsOnly = data.filter(
        (c) => c.type === 'BoardChart'
      )

      const chartsOnly = data.filter(
        (c) => c.type !== 'BoardChart'
      )

      const chartMap = {}
      chartsOnly.forEach((chart) => {
        chartMap[chart.id] = chart
      })

      setBoards(boardsOnly)
      setChartsMap(chartMap)

      // Charts de series (LineChart) para los minigráficos: vienen de
      // /dashboardCharts porque /indicatorCharts los excluye. Si falla,
      // el tablero se muestra igual, sin columna derecha.
      try {
        const { data: seriesCharts } = await request(
          `${backend['Mas Agua']}/dashboardCharts`,
          'GET'
        )
        const seriesMap = {}
        ;(seriesCharts || []).forEach((chart) => {
          if (chart.type === 'LineChart') seriesMap[chart.id] = chart
        })
        setSeriesChartsMap(seriesMap)
      } catch (error) {
        console.error('Error cargando charts de series:', error)
      }

      // 3️⃣ Influx
      const allVars = extractInfluxVars(data)
      fetchMultipleData(allVars)

      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(
        () => fetchMultipleData(allVars),
        30000
      )

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      })
    }
  }

  const fetchMultipleData = async (allVars) => {
    try {
      const { data } = await request(
        `${backend['Mas Agua']}/multipleDataInflux`,
        'POST',
        allVars
      )
      setInflValues(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error multipleDataInflux:', error)
    }
  }

  useEffect(() => {
    getBoards()
    return () => clearInterval(intervalRef.current)
  }, [])


  return (
    <Grid container spacing={2}>
      {boards.map((board) => {
        const cfg = Object.fromEntries(
          board.ChartConfig.map((c) => [c.key, c.value])
        )

        const topLeftChart =
          chartsMap[cfg['board.top.leftChartId']] || null

        const topRightChart =
          chartsMap[cfg['board.top.rightChartId']] || null

        let miniChartIds = []
        try {
          miniChartIds = JSON.parse(cfg['board.mini.chartIds'] || '[]')
        } catch {
          miniChartIds = []
        }
        const miniCharts = miniChartIds
          .map((id) => seriesChartsMap[id])
          .filter(Boolean)

        // La minivista es densa: cada tablero ocupa el ancho completo.
        return (
          <Grid item xs={12} key={board.id}>
            <BoardChart
              title={board.name}
              ChartData={board.ChartData}
              ChartConfig={board.ChartConfig}
              topLeftChart={topLeftChart}
              topRightChart={topRightChart}
              miniCharts={miniCharts}
              inflValues={inflValues}
              lastUpdate={lastUpdate}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Boards
