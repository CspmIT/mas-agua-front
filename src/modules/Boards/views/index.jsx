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
        // Las variables Gralf no se consultan por multipleDataInflux:
        // las resuelve el propio GralfChart con su endpoint.
        if (item.InfluxVars && !item.InfluxVars?.varsInflux?.gralf) {
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

  // ── Pestañas: un tab por tablero, persistido en localStorage ──
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!boards.length) return
    const saved = Number(localStorage.getItem('boards.activeTabId'))
    const exists = boards.some((b) => b.id === saved)
    setActiveId(exists ? saved : boards[0].id)
  }, [boards])

  const selectTab = (id) => {
    setActiveId(id)
    localStorage.setItem('boards.activeTabId', String(id))
  }

  // Estado de bombeo del tablero, para el punto de la pestaña:
  // verde = bomba encendida, rojo = apagada, gris = sin datos.
  const pumpStatusOf = (board) => {
    const item = (board.ChartData || []).find(
      (d) => d.key === 'board.pumping.status'
    )
    const varId = item?.InfluxVars?.id
    const val = varId != null ? inflValues[varId] : undefined
    if (val === true) return 'on'
    if (val === false) return 'off'
    if (typeof val === 'number') return val > 0 ? 'on' : 'off'
    if (typeof val === 'string') {
      const t = val.toLowerCase()
      if (t.includes('encendid') || t.includes('marcha')) return 'on'
      if (t.includes('apagad') || t.includes('parad')) return 'off'
    }
    return 'na'
  }

  const DOT_CLASS = {
    on: 'bg-[#10B981]',
    off: 'bg-rose-500',
    na: 'bg-slate-400',
  }

  const renderBoard = (board, embedded) => {
    const cfg = Object.fromEntries(
      board.ChartConfig.map((c) => [c.key, c.value])
    )

    const topLeftChart = chartsMap[cfg['board.top.leftChartId']] || null
    const topRightChart = chartsMap[cfg['board.top.rightChartId']] || null

    const parseIds = (key) => {
      try {
        const ids = JSON.parse(cfg[key] || '[]')
        return Array.isArray(ids) ? ids : []
      } catch {
        return []
      }
    }
    // Un drawer puede asociar LineCharts (seriesChartsMap) o GralfCharts
    // (vienen en chartsMap, junto al resto de los charts sin series).
    const resolveCharts = (ids) =>
      ids
        .map((id) => {
          const serie = seriesChartsMap[id]
          if (serie) return serie
          const chart = chartsMap[id]
          return chart?.type === 'GralfChart' ? chart : null
        })
        .filter(Boolean)

    const miniCharts = resolveCharts(parseIds('board.mini.chartIds'))

    // Históricos asociados a elementos del tablero (drawers)
    const drawers = {
      topLeft: resolveCharts(parseIds('board.drawer.topLeft')),
      topRight: resolveCharts(parseIds('board.drawer.topRight')),
      level: resolveCharts(parseIds('board.drawer.level')),
      pumping: resolveCharts(parseIds('board.drawer.pumping')),
      room: [0, 1, 2, 3].map((i) =>
        resolveCharts(parseIds(`board.drawer.room.item${i}`))
      ),
    }

    return (
      <BoardChart
        title={board.name}
        ChartData={board.ChartData}
        ChartConfig={board.ChartConfig}
        topLeftChart={topLeftChart}
        topRightChart={topRightChart}
        miniCharts={miniCharts}
        drawers={drawers}
        inflValues={inflValues}
        lastUpdate={lastUpdate}
        embedded={embedded}
      />
    )
  }

  // Un solo tablero: se muestra como siempre, sin barra de pestañas
  if (boards.length <= 1) {
    return (
      <Grid container spacing={2}>
        {boards.map((board) => (
          <Grid item xs={12} key={board.id}>
            {renderBoard(board, false)}
          </Grid>
        ))}
      </Grid>
    )
  }

  const activeBoard = boards.find((b) => b.id === activeId) || boards[0]

  // Varios tableros: una sola card con pestañas. Sólo el activo se monta,
  // así los inactivos no consultan Influx (minigráficos, drawers, gralf).
  return (
    <div className='w-full rounded-3xl border border-[#1f4e79]/8 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-[0_2px_8px_rgba(15,42,68,0.05),0_24px_56px_-30px_rgba(15,42,68,0.28)] overflow-hidden'>
      {/* Barra de pestañas con el degradado de la navbar */}
      <div
        className='flex flex-wrap items-center gap-1 px-2.5 py-1.5 border-b border-white/10'
        style={{ background: 'linear-gradient(90deg, #3f80bd 0%, #2c6aa0 50%, #1f4e79 100%)' }}
      >
        {boards.map((board) => {
          const isActive = board.id === activeBoard.id
          const status = pumpStatusOf(board)
          return (
            <button
              key={board.id}
              type='button'
              onClick={() => selectTab(board.id)}
              className={[
                'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border-0 text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-white text-[#1f4e79] shadow-[0_4px_12px_-2px_rgba(7,34,60,0.5)]'
                  : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASS[status]}`}
              />
              {board.name}
            </button>
          )
        })}
        <span className='flex-1' />
        {lastUpdate && (
          <span className='text-[11.5px] text-white/70'>
            Última actualización{' '}
            <b className='font-semibold tabular-nums text-white'>
              {new Date(lastUpdate).toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).replace(',', '')}
            </b>
          </span>
        )}
      </div>

      {renderBoard(activeBoard, true)}
    </div>
  )
}

export default Boards
