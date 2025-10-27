import { FormLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TableCustom from '../../../components/TableCustom'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import GrafBarra from '../../../components/Graphs/barchart'


const ChartInvoice = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    try {
      setLoading(true)
      const { data } = await request(`${url}/graf_dif_men_osmosis`, 'GET')
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

  const seriesData = data.map(item => ({
    name: item[0],
    value: Number(item[1]),
  }))

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-300 dark:border-gray-700 pt-3 mt-2">
        <FormLabel className="w-full text-center !text-xl font-bold !text-black">
            Evolución del Consumo
        </FormLabel>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg bg-white dark:bg-[#2e2e2e]">
        <GrafBarra
          title=" "
          seriesName="Consumo (m³)"
          seriesData={seriesData}
          color="#4A90E2"
        />
      </div>

     
    </>
  )
}

export default ChartInvoice
