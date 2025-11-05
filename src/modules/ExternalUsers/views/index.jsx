import React, { useEffect, useState } from 'react'
import { storage } from '../../../storage/storage'
import LoaderComponent from '../../../components/Loader'
import CardCustom from '../../../components/CardCustom'
import { FormLabel } from '@mui/material'
import TabsInvoice from '../components/TabsInvoice'
import Home from '../../home/views'
import ChartsDashboard from '../../dashBoard/views/ChartsDashboard'
import ChartInvoice from '../components/ChartInvoice'

const ExternalUsers = () => {
  const [loading, setLoading] = useState(true)
  const user = storage.get('usuario')


  useEffect(() => {
    setLoading(false);
  }, [])

  return (
    <div className="flex flex-col w-full h-full gap-6">
      {loading ? (
        <LoaderComponent />
      ) : (
        <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col gap-6 transition-all">
          {/* Header */}
          <div className="flex flex-col">
            <FormLabel className='w-full text-center !text-3xl font-bold mb-4 !pb-3 border-b border-gray-300 dark:border-gray-700 '>
              Gráficas de consumo{user?.name ? ` - ${user.name}` : ''}
            </FormLabel>
            <CardCustom className="w-full !bg-gray-200 dark:bg-gray-800 shadow-md rounded-2xl p-4 flex flex-col gap-4 transition-all">
            <Home />
            </CardCustom>
          </div>


          {/* Tablas y graficos de facturacion */}
          <TabsInvoice />
          <ChartInvoice />

          {/* Gráficos */}
          <div className="flex flex-col">
            <FormLabel className='w-full text-center !text-xl !text-black font-bold mb-4 !py-3 border-y border-gray-300 dark:border-gray-700 '>
            Buscar registros de ingreso
            </FormLabel>
            <CardCustom className="w-full !bg-gray-200 dark:bg-gray-800 shadow-md rounded-2xl p-4 flex flex-col gap-4 transition-all">
            <ChartsDashboard />
            </CardCustom>
          </div>

        </CardCustom>
      )}
    </div>
  )
}

export default ExternalUsers