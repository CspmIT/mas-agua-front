import { Button, MenuItem, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
// import DataGenerator from '../../../components/DataGenerator/DataGenerator'
import VarsProvider, {
} from '../../../components/DataGenerator/ProviderVars'
// import SelectorVars from '../../../components/SelectorVars/SelectorVars'
import GraphVariableSelector from '../../../components/SelectorVars/GraphVariableSelector'
import { configs } from '../configs/configs'
import ConfigSimple from '../components/ConfigSimple'
import Swal from 'sweetalert2'
import { backend } from '../../../utils/routes/app.routes'
import { request } from '../../../utils/js/request'

const ConfigGraphic = () => {
    const { id } = useParams()
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const navigate = useNavigate()

    const onSubmit = async (data) => {
        if(data?.idVar === undefined){
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'Debe seleccionar una variable para el grafico',
            })
            return
        }
        data.porcentage = data.porcentage == true
        data.border = data.border == true
        data.maxValue = parseFloat(data.maxValue)
        const endPoint = `${backend['Mas Agua']}/charts`
        try {
            
            const response = await request(endPoint, 'POST', data)
            if(response){
                Swal.fire({
                    icon: 'success',
                    title: 'Exito!',
                    html: 'Se guardo correctamente la configuracion',
                })
                navigate('/')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Atencion!',
                html: 'Ocurrio un error al intentar guardar la configuracion',
            })
            console.error(error.message) 
        }
    }
    const onError = (errors) => {
        Swal.fire({
            icon: 'error',
            title: 'Atencion!',
            html: 'Debe completar todos los campos',
        })
    } 

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
                    <input type="hidden" {...register('type')} value={configs[id].typeGraph}/>
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
