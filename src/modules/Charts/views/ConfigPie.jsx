import { useForm } from 'react-hook-form'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import HeaderForms from '../components/HeaderForms'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import DoughnutChart from '../components/DoughnutChart'
import SelectVars from '../components/SelectVars'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { InfoOutlined } from '@mui/icons-material'
import { DoughnutChartschema } from '../schemas/DoughnutChartSchema'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { useNavigate } from 'react-router-dom'

const ConfigPie = () => {
    const [title, setTitle] = useState('')
    const [categories, setCategories] = useState([])
    const [keySelectorVar, setKeySelectorVar] = useState(0)
    const navigate = useNavigate()

    const addCategory = () => {
        const { categoryName, idVar, colorCategory } = getValues()
        const newCategory = {
            value: idVar,
            name: categoryName,
            itemStyle: {
                color: colorCategory,
            },
        }

        setCategories([...categories, newCategory])
        setKeySelectorVar(keySelectorVar + 1)
        setValue('categoryName', '')
        setValue('colorCategory', '#000000')
        setValue('idVar', false)
    }
    const send = async () => {
        const fieldsToValidate = ['title']
        if (categories.length === 0) {
            fieldsToValidate.push('categoryName', 'colorCategory', 'idVar')
        }

        const isValid = await trigger(fieldsToValidate)
        if (!isValid) {
            return
        }

        if (categories.length === 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Atencion',
                text: 'Debe haber al menos una categoria para poder guardar el grafico',
            })
            return
        }
        const { title } = getValues()

        const formatedCategories = categories.map(category =>  ({
            var_id: category.value,
            name: category.name,
            color: category?.itemStyle?.color
        }))

        const sendObject = {
            type: 'PieChart',
            categories: formatedCategories,
            title,
        }

        try {
            const url = `${backend[import.meta.env.VITE_APP_NAME]}/pie`
            const newChart = await request(url, 'POST', sendObject)
            if(newChart.data){
                await Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    text: 'El grafico se creo correctamente' 
                })
                navigate('/')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se puedo guardar el grafico',
            })
        }
    }

    const {
        getValues,
        register,
        setValue,
        formState: { errors },
        trigger,
    } = useForm({
        resolver: zodResolver(DoughnutChartschema),
        mode: 'onChange',
    })

    return (
        <VarsProvider>
            <div className="w-full bg-white p-5 rounded-lg shadow-md h-fit">
                <HeaderForms />
                <div className="flex gap-4 max-sm:flex-col items-center">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex max-sm:flex-col w-full gap-3"
                    >
                        <Card className="flex flex-col w-full max-sm:w-full p-3 mb-4 gap-3">
                            <TextField
                                placeholder="Titulo"
                                {...register('title', {
                                    onChange: (e) => {
                                        setTitle(e.target.value)
                                    },
                                })}
                                error={!!errors?.title}
                                helperText={errors?.title?.message}
                            />

                            <SelectVars
                                key={keySelectorVar}
                                label={'Seleccione una variable'}
                                setValue={setValue}
                            />
                            <TextField
                                {...register('categoryName')}
                                error={!!errors?.categoryName}
                                helperText={errors?.categoryName?.message}
                                placeholder="Nombre de la categoria (variable)"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip
                                                title="Es el nombre que se mostrará en el gráfico para la variable."
                                                arrow
                                            >
                                                <IconButton>
                                                    <InfoOutlined fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                error={!!errors?.colorCategory}
                                helperText={errors?.colorCategory?.message}
                                placeholder="Color de la categoria"
                                type="color"
                                defaultValue={'#000000'}
                                {...register('colorCategory')}
                            />
                            <Card className="flex-grow">
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        align="center"
                                        component="div"
                                        className="mb-2"
                                    >
                                        Categorias del grafico
                                    </Typography>
                                    <List>
                                        {categories.map((item) => (
                                            <ListItem
                                                key={item.value}
                                                className="flex justify-between items-center"
                                            >
                                                <ListItemText
                                                    primary={item.name}
                                                />
                                                <IconButton
                                                    onClick={() => {}}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                            <div className="flex max-sm:flex-col gap-3">
                                <Button
                                    className="w-full"
                                    variant="contained"
                                    color="secondary"
                                    type="button"
                                    onClick={addCategory}
                                >
                                    Agregar categoria
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    onClick={send}
                                >
                                    Guardar Grafico
                                </Button>
                            </div>
                        </Card>
                    </form>
                    <Card className="w-full max-sm:w-full p-3 mb-4">
                        <Typography variant="h5" align="center">
                            {title}
                        </Typography>
                        <div className="h-80">
                            <DoughnutChart data={categories} />
                        </div>
                    </Card>
                </div>
            </div>
        </VarsProvider>
    )
}

export default ConfigPie
