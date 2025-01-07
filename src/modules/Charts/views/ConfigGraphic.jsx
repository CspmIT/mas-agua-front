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
import Swal from 'sweetalert2'

const ConfigGraphic = () => {
    const { id } = useParams()
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm()


    const onSubmit = (data) => {
        if(data?.idVar === undefined){
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'Debe seleccionar una variable para el grafico',
            })
            return
        }
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
                    {
                        !configs[id].singleValue ? (
                            <GraphVariableSelector />
                        ) : (
                            <ConfigSimple setValue={setValue} register={register} errors={errors} id={id}/>
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
