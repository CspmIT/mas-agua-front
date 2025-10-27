import { FormLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TableCustom from '../../../components/TableCustom'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { BorderTop } from '@mui/icons-material'

const TabsInvoice = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    try {
      setLoading(true)
      const { data } = await request(`${url}/average-tax`, 'GET')
      setData(data)
    } catch (error) {
      console.error(error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron obtener los datos.',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <LoaderComponent />

  if (!data) return null

  const columnsFactura = [
    {
      header: 'Lectura Anterior',
      columns: [
        { header: 'Fecha', accessorKey: 'fecha_ant', size: 100 },
        { header: 'Valor', accessorKey: 'valor_ant', size: 100 },
      ],
    },
    {
      header: 'Lectura Actual',
      columns: [
        { header: 'Fecha', accessorKey: 'fecha_act', size: 50, },
        { header: 'Valor', accessorKey: 'valor_act', size: 50 },
      ],
    },
    {
      header: 'Consumo', accessorKey: 'consumo', size: 30,
    },
    {
      header: 'Días', accessorKey: 'dias', size: 20,
    },
    {
      header: 'Periodo', accessorKey: 'periodo', size: 40,
    },
  ]


  const columnsEstimacion = [
    {
      header: 'Última factura',
      columns: [
        { header: 'Fecha', accessorKey: 'fecha_act', size: 50 },
        { header: 'Valor', accessorKey: 'valor_act', size: 50},
      ],
    },
    {
      header: 'Lectura en curso',
      columns: [
        { header: 'Fecha', accessorKey: 'fecha', size: 50 },
        { header: 'Valor', accessorKey: 'valor', size: 50 },
      ],
    },
    {
      header: 'Consumo', accessorKey: 'consumo', size: 30,
    },
    {
      header: 'Días', accessorKey: 'dias', size: 20,
    },
    {
      header: 'Estimado', accessorKey: 'estimado', size: 40,
    },
    {
      header: 'Periodo', accessorKey: 'periodo', size: 40,
    },
  ]

  const detalle = [
    {
      fecha_ant: data.actual.fecha_ant,
      valor_ant: data.actual.valor_ant,
      fecha_act: data.actual.fecha_act,
      valor_act: data.actual.valor_act,
      consumo: data.actual.consumo,
      dias: data.actual.dias,
      periodo: data.actual.periodo,
    },
  ]

  const estimacion = [
    {
      fecha_act: data.actual.fecha_act,
      valor_act: data.actual.valor_act,
      fecha: data.prox.fecha,
      valor: data.prox.valor,
      consumo: data.prox.consumo,
      dias: data.prox.dias,
      estimado: data.prox.estimado,
      periodo: data.prox.periodo,
    },
  ]

  return (
    <>
      {/* ----- DETALLE FACTURADO ----- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-y border-gray-300 dark:border-gray-700 py-3 mb-2">
        <FormLabel className="w-full text-center !text-xl font-bold !text-black">
          Detalle del servicio facturado
        </FormLabel>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg shadow-md">
        <TableCustom
          columns={columnsFactura}
          data={detalle}
          pagination={false}
          density="comfortable"
          header={{
            background: '#bebebe',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #999',
          }}
          body={{
            backgroundColor: 'rgba(209, 213, 219, 0.31)',
            '& td': {
              textAlign: 'center',
              border: '1px solid #999',
            },
          }}
          bodyContent={{
            textAlign: 'center',
          }}
          card={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
          footer={{
            background: '#bebebe',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        />

      </div>

      {/* ----- ESTIMACIÓN PRÓXIMA FACTURA ----- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-y border-gray-300 dark:border-gray-700 py-3">
        <FormLabel className="w-full text-center !text-xl font-bold !text-black">
          Estimación de su próxima factura
        </FormLabel>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg shadow-md">
        <TableCustom
          columns={columnsEstimacion}
          data={estimacion}
          pagination={false}
          density="comfortable"
          header={{
            background: '#bebebe',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #999',
          }}
          body={{
            backgroundColor: 'rgba(240, 240, 240, 0.4)',
            '& td': {
              textAlign: 'center',
              border: '1px solid #999',
            },
          }}
          bodyContent={{
            textAlign: 'center',
          }}
          card={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
          footer={{
            background: '#bebebe',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        />

      </div>
    </>
  )
}

export default TabsInvoice
