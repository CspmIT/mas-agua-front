import React, { useEffect, useRef, useState } from 'react'
import { Grid } from '@mui/material'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import BoardChart from '../../Charts/components/BoardChart'

const Boards = () => {
  const [boards, setBoards] = useState([])
  const [chartsMap, setChartsMap] = useState({})
  const [inflValues, setInflValues] = useState({})
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

        return (
          <Grid item xs={6} key={board.id}>
            <BoardChart
              title={board.name}
              ChartData={board.ChartData}
              ChartConfig={board.ChartConfig}
              topLeftChart={topLeftChart}
              topRightChart={topRightChart}
              inflValues={inflValues}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Boards
