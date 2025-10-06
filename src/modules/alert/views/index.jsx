import React from 'react'
import CardCustom from '../../../components/CardCustom'
import { FormLabel } from '@mui/material'

const Alert = () => {
    return (
        <>
            <div className={'flex flex-col w-full gap-4'}>
                <CardCustom className='w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'>
                    <div className='relative flex justify-between items-center mb-4'>
                        <FormLabel className='w-full text-center !text-2xl'>Evento Criticos</FormLabel>
                    </div>

                    {/* TABLA */}

                </CardCustom>

                <CardCustom className='w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'>
                    <div className='relative flex justify-between items-center mb-4'>
                        <FormLabel className='w-full text-center !text-2xl'>Otros Eventos</FormLabel>
                    </div>

                    {/* TABLA */}
                    
                </CardCustom>

            </div>
        </>
    )
}

export default Alert