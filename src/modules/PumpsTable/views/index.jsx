import React, { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, FormLabel, getFormControlLabelUtilityClasses } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import { useState } from 'react'

const PumpsTable = () => {
  const [listpumps, setListPumps] = useState([])
  const [columnsTable, setColumnsTable] = useState([])
  const [loading, setLoading] = useState(true)

  const readBombStatus = async (url, bombId) => {
    try {
      const { data } = await request(
        `${url}/bombs_PLC/read`,
        'POST',
        { bombId }
      )
  
      /**
       * Asumo que el PLC responde algo tipo:
       * { plcResponse: { estado: 1, modo: 'AUTO' } }
       */
      return {
        status: data?.plcResponse?.estado ?? null,
        actual_mode: data?.plcResponse?.modo ?? 'Sin datos',
      }
  
    } catch (error) {
      console.error(`Error leyendo bomba ${bombId}`, error)
      return {
        status: null,
        actual_mode: 'Sin datos',
      }
    }
  }
  

  const fetchPumps = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
  
    try {
      setLoading(true)
  
      // 1️⃣ Traer bombas
      const { data } = await request(`${url}/bombs_PLC`, 'GET')
  
      // 2️⃣ Leer estado real en PLC (en paralelo)
      const pumpsWithStatus = await Promise.all(
        data.map(async (bomb) => {
          const plcData = await readBombStatus(url, bomb.id)
          return {
            ...bomb,
            ...plcData,
          }
        })
      )
  
      // 3️⃣ Columnas
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
  
            if (status === null || status === undefined) {
              return (
                <span style={{ fontWeight: 'bold', color: '#eab308' }}>
                  Sin datos
                </span>
              )
            }
  
            return (
              <span
                style={{
                  fontWeight: 'bold',
                  color: status ? 'green' : 'grey',
                }}
              >
                {status ? 'En Marcha' : 'Apagada'}
              </span>
            )
          },
        },
        {
          header: 'Modo Actual',
          accessorKey: 'actual_mode',
        },
        {
          header: 'Acciones',
          accessorKey: 'actions',
          Cell: ({ row }) => (
            <Box display="flex" gap={1}>
              <Button variant="contained" size="small">
                Automatico
              </Button>
              <Button variant="contained" color="secondary" size="small">
                Prender
              </Button>
            </Box>
          ),
        },
      ]
  
      setListPumps(pumpsWithStatus)
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
  

  const fetchData_Bombs = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    try {
      const { data } = await request(`${url}/data_bombeo`, 'GET')

      const bombeoStatus = data.reduce((acc, item) => {
        const key = Object.keys(item)[0]
        acc[key] = item[key]
        return acc
      }, {})

      setListPumps(prev =>
        prev.map(bomb => ({
          ...bomb,
          status: bombeoStatus[bomb.name] !== undefined
            ? bombeoStatus[bomb.name] === '1'
            : null
        }))
      )

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        text: 'No se pudo obtener el estado de las bombas',
      })
    }
  }


  useEffect(() => {
    fetchPumps();
    fetchData_Bombs();

    const interval = setInterval(() => {
      fetchData_Bombs()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      {loading ? (
        <LoaderComponent />
      ) : (
        <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-6 transition-all">

          {/* Header responsivo */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-300 dark:border-gray-700 pb-3">
            <FormLabel className='w-full text-center !text-3xl'>
              Bombeo de succión
            </FormLabel>
          </div>

          {/* Tabla responsiva */}
          <div className="flex-1 overflow-x-auto rounded-lg shadow-md">
            <TableCustom
              columns={columnsTable}
              data={listpumps.length ? listpumps : []}
              pagination={true}
              pageSize={10}
              density="compact"
              header={{
                background: 'rgb(190 190 190)',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
              toolbarClass={{ background: 'rgb(190 190 190)' }}
              body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
              footer={{ background: 'rgb(190 190 190)' }}
              topToolbar
            />
          </div>
        </CardCustom>
      )}
    </div>
  )
}

export default PumpsTable