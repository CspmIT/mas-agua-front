import { Button, MenuItem, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import DataGenerator from '../../../components/DataGenerator/DataGenerator'
import VarsProvider, {
} from '../../../components/DataGenerator/ProviderVars'
import SelectorVars from '../../../components/SelectorVars/SelectorVars'
import GraphVariableSelector from '../../../components/SelectorVars/GraphVariableSelector'
import { configs } from '../configs/configs'
import ConfigSimple from '../components/ConfigSimple'

const ConfigGraphic = () => {
    const { id } = useParams()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const globalVars = [
        {
            id: 1,
            name: 'Variable 1',
            unit: '°C',
            value: 25,
            type: 'number',
            date: '2021-10-22',
        },
        {
            id: 2,
            name: 'Variable 2',
            unit: '°C',
            value: 30,
            type: 'number',
            date: '2021-10-22',
        },
        {
            id: 3,
            name: 'Variable 3',
            unit: '°C',
            value: 35,
            type: 'number',
            date: '2021-10-22',
        },
        {
            id: 4,
            name: 'Variable 4',
            unit: '°C',
            value: 40,
            type: 'number',
            date: '2021-10-22',
            dato_consulta: {
                calculo: 'Variable 1 + Variable 2 /100',
                variable: [
                    {
                        name: 'Variable 1',
                        topico: 'Temperatura',
                        field: 'Temperatura',
                        time: '2021-10-22',
                        unit: '°C',
                    }
                ],
            }
        },
    ]

    const onSubmit = (data) => {
        console.log(data)
    }
    const onError = (errors) => console.log(errors)

    return (
        <VarsProvider>
            <div className="w-full bg-white p-5 rounded-lg shadow-md h-fit">
                <Typography className="text-center !mb-5" variant="h3">
                    Configuracion del grafico {id}
                </Typography>
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="flex flex-col gap-4 items-center"
                >
                    <div className="flex w-full justify-center">
                        <TextField
                            type='text'
                            className="w-1/3 max-sm:w-full"
                            label="Titulo del grafico"
                            {...register('title', {
                                required: 'Este campo es requerido',
                            })}
                            error={errors.title}
                            helperText={errors.title && errors.title.message}
                        />
                    </div>

                    {/* COMPONENTE DE VARIABLES */}
                    {/* <DataGenerator register={register} errors={errors} /> */}
                    {
                        !configs[id].singleValue ? (
                            <GraphVariableSelector />
                        ) : (
                            <ConfigSimple register={register} errors={errors} id={id}/>
                        )
                    }
                    {/* <SelectorVars /> */}
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </VarsProvider>
    )
}

export default ConfigGraphic
