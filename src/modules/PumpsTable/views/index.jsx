import React, { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, Chip, FormLabel, getFormControlLabelUtilityClasses } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import { useState } from 'react'
import InfoCard from '../components/InfoCard'

const PumpsTable = () => {
  const [listpumps, setListPumps] = useState([])
  const [infoSuccion, setInfoSuccion] = useState([])
  const [columnsTable, setColumnsTable] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPumps = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    try {
      setLoading(true)

      const { data } = await request(`${url}/bombs_PLC`, 'GET')
      setInfoSuccion(data.info_succion)
      setListPumps(data.bombs)

      const columns = [
        {
          header: 'Bomba',
          accessorKey: 'name',
        },
        {
          header: 'Estado',
          accessorKey: 'status',
          Cell: ({ row }) => {
            const status = row.original.status

            let label = 'Sin datos'
            let color = 'warning'

            if (status === true) {
              label = 'En Marcha'
              color = 'success'
            } else if (status === false) {
              label = 'Apagada'
              color = 'default'
            }

            return (
              <Chip
                label={label}
                color={color}
                variant="filled"
                sx={{ fontWeight: 'bold' }}

              />
            )
          },
        },
        {
          header: 'Modo Actual',
          accessorKey: 'actual_mode',
          Cell: ({ row }) => {
            const mode = row.original.actual_mode

            let color = 'default'
            let label = mode || 'Sin datos'

            switch (mode) {
              case 'Automático':
                color = 'warning'
                break
              case 'Encendido forzado':
                color = 'success'
                break
              case 'Apagado forzado':
                color = 'error'
                break
              default:
                color = 'primary'
                label = 'Sin datos'
                break
            }

            return (
              <Chip
                label={label}
                color={color}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            )
          },
        },
        {
          header: 'Acciones',
          accessorKey: 'actions',
          Cell: ({ row }) => {
            const actualMode = row.original.actual_mode
            const isAutomatic = actualMode === 'Automático'

            return (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  disabled={isAutomatic}
                >
                  AUTO
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={!isAutomatic}
                >
                  ON
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={!isAutomatic}
                >
                  OFF
                </Button>
              </Box>
            )
          },
        }
      ]

      setColumnsTable(columns)

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        text: 'No se pudieron obtener los datos de las bombas',
      })
    } finally {
      setLoading(false)
    }
  }

  //FUNCION PARA CONSULTAR ESTADO DE LA BOMBA
  const refreshBombStatus = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    try {
      const { data } = await request(`${url}/data_bombeo`, 'GET')

      setListPumps(prev =>
        prev.map(bomb => ({
          ...bomb,
          status: data.bombas[bomb.name] ?? null,
          actual_mode: data.modos[bomb.name] ?? null
        }))
      )
      setInfoSuccion(data.info_succion)
    } catch (error) {
      console.error(error)
    }
  }


  useEffect(() => {
    fetchPumps();

    const interval = setInterval(() => {
      refreshBombStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      {loading ? (
        <LoaderComponent />
      ) : (
        <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-4 transition-all">

          {/* Header responsivo */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-300 dark:border-gray-700 pb-3">
            <FormLabel className='w-full text-center !text-3xl'>
              Bombeo de succión
            </FormLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <InfoCard
              label="Estado"
              value={infoSuccion.var_2}
              color="green"
            />
            <InfoCard
              label="Destino"
              value={infoSuccion.Destino}
              color="blue"
            />
            <InfoCard
              label="Configuración"
              value={infoSuccion.Configuracion}
              color="indigo"
            />
            <InfoCard
              label="Activaciones manuales"
              value={infoSuccion.AcM || '-'}
              color="orange"
            />
            <InfoCard
              label="Fuera de servicio"
              value={infoSuccion.FuS || '-'}
              color="red"
            />
          </div>

          {/* Tabla responsiva */}
          <div className="flex-1 overflow-x-auto rounded-lg shadow-md">
            <TableCustom
              columns={columnsTable}
              data={listpumps.length ? listpumps : []}
              pagination={true}
              pageSize={30}
              density="compact"
              header={{
                background: 'rgb(190 190 190)',
                fontSize: '14px',
                fontWeight: 'bold',
                paddingTop: 1,
              }}
              toolbarClass={{ background: 'rgb(190 190 190)' }}
              body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
              footer={{ background: 'rgb(190 190 190)' }}
            />
          </div>
        </CardCustom>
      )}
    </div>
  )
}

export default PumpsTable