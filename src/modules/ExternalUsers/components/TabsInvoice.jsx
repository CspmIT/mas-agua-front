import { FormLabel } from '@mui/material'
import React from 'react'
import TableCustom from '../../../components/TableCustom'


const TabsInvoice = () => {
  return (
    <>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-y border-gray-300 dark:border-gray-700 py-3">
            <FormLabel className='w-full text-center !text-xl font-bold'>
              Detalle del servicio facturado
            </FormLabel>
          </div>
          <div className="flex-1 overflow-hidden rounded-lg shadow-md">
            {/* <TableCustom
              columns={columnsTable}
              data={listLogs_Alarms.length ? listLogs_Alarms : []}
              pagination={true}
              pageSize={10}
              density='compact'
              header={{
                background: 'rgb(190 190 190)',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
              toolbarClass={{ background: 'rgb(190 190 190)' }}
              body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
              footer={{ background: 'rgb(190 190 190)' }}
              ChangeColorRow={ChangeColorRow}
              topToolbar
            /> */}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-y border-gray-300 dark:border-gray-700 py-3">
            <FormLabel className='w-full text-center !text-xl font-bold'>
              Estimación de su próxima factura
            </FormLabel>
          </div>
          <div className="flex-1 overflow-hidden rounded-lg shadow-md">
            {/* <TableCustom
              columns={columnsTable}
              data={listLogs_Alarms.length ? listLogs_Alarms : []}
              pagination={true}
              pageSize={10}
              density='compact'
              header={{
                background: 'rgb(190 190 190)',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
              toolbarClass={{ background: 'rgb(190 190 190)' }}
              body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
              footer={{ background: 'rgb(190 190 190)' }}
              ChangeColorRow={ChangeColorRow}
              topToolbar
            /> */}
          </div>
    </>
  )
}

export default TabsInvoice