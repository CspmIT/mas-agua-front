import { useForm } from 'react-hook-form'
import VarsProvider from '../../../components/DataGenerator/ProviderVars'
import HeaderForms from '../components/HeaderForms'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
} from '@mui/material'
import DoughnutChart from '../components/DoughnutChart'
import SelectVars from '../components/SelectVars'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import {
    AddCircleOutline,
    InfoOutlined,
    SaveOutlined,
} from '@mui/icons-material'
import { useState } from 'react'
import { DoughnutChartschema } from '../schemas/DoughnutChartSchema'
import Swal from 'sweetalert2'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { useNavigate } from 'react-router-dom'

const shellSx = {
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.12)',
    p: { xs: 2, sm: 2.5 },
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
}

const sectionSx = {
    borderRadius: '14px',
    border: '1px solid rgba(15, 42, 68, 0.06)',
    backgroundColor: 'transparent',
    p: { xs: 1.75, sm: 2 },
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    'body.dark &': { border: '1px solid rgba(255, 255, 255, 0.06)' },
}

const previewCardSx = {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(15, 42, 68, 0.08)',
    boxShadow:
        '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    'body.dark &': {
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    },
}

const primaryPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.85,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
}

const addPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    minHeight: 0,
    borderColor: 'rgba(44, 106, 160, 0.4)',
    color: '#2c6aa0',
    backgroundColor: 'rgba(44, 106, 160, 0.04)',
    '&:hover': {
        borderColor: '#2c6aa0',
        backgroundColor: 'rgba(44, 106, 160, 0.1)',
    },
}

const SectionTitle = ({ children, right }) => (
    <div className='flex items-center justify-between px-1 -mt-0.5'>
        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400'>
            {children}
        </div>
        {right}
    </div>
)

const ConfigPie = () => {
    const [title, setTitle] = useState('')
    const [categories, setCategories] = useState([])
    const [keySelectorVar, setKeySelectorVar] = useState(0)
    const navigate = useNavigate()

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

    const addCategory = async () => {
        const isValid = await trigger(['categoryName', 'colorCategory', 'idVar'])
        if (!isValid) return
        const { categoryName, idVar, colorCategory } = getValues()
        const newCategory = {
            value: idVar,
            name: categoryName,
            itemStyle: { color: colorCategory },
        }
        setCategories([...categories, newCategory])
        setKeySelectorVar(keySelectorVar + 1)
        setValue('categoryName', '')
        setValue('colorCategory', '#000000')
        setValue('idVar', false)
    }

    const removeCategory = (value) => {
        setCategories(categories.filter((c) => c.value !== value))
    }

    const send = async () => {
        const isValid = await trigger(['title'])
        if (!isValid) return
        if (categories.length === 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Atención',
                text: 'Debe haber al menos una categoría para poder guardar el gráfico',
            })
            return
        }
        const { title } = getValues()
        const formatedCategories = categories.map((category) => ({
            var_id: category.value,
            name: category.name,
            color: category?.itemStyle?.color,
        }))
        const sendObject = { type: 'PieChart', categories: formatedCategories, title }

        try {
            const url = `${backend[import.meta.env.VITE_APP_NAME]}/pie`
            const newChart = await request(url, 'POST', sendObject)
            if (newChart.data) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'El gráfico se creó correctamente',
                })
                navigate('/')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el gráfico',
            })
        }
    }

    return (
        <VarsProvider>
            <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
                <HeaderForms />

                <Box sx={shellSx}>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className='flex flex-col lg:flex-row gap-4 w-full'
                    >
                        <div className='flex flex-col gap-3 w-full lg:w-7/12'>
                            <Box sx={sectionSx}>
                                <SectionTitle>Información</SectionTitle>
                                <TextField
                                    size='small'
                                    fullWidth
                                    label='Título del gráfico'
                                    {...register('title', {
                                        onChange: (e) => setTitle(e.target.value),
                                    })}
                                    error={!!errors?.title}
                                    helperText={errors?.title?.message}
                                />
                            </Box>

                            <Box sx={sectionSx}>
                                <SectionTitle>Nueva categoría</SectionTitle>
                                <SelectVars
                                    key={keySelectorVar}
                                    label='Seleccione una variable'
                                    setValue={setValue}
                                />
                                <div className='flex flex-wrap gap-2'>
                                    <div style={{ flex: '2 1 220px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            {...register('categoryName')}
                                            error={!!errors?.categoryName}
                                            helperText={errors?.categoryName?.message}
                                            label='Nombre de la categoría'
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <Tooltip
                                                            title='Es el nombre que se mostrará en el gráfico para la variable.'
                                                            arrow
                                                        >
                                                            <IconButton size='small'>
                                                                <InfoOutlined fontSize='small' />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 140px' }}>
                                        <TextField
                                            fullWidth
                                            size='small'
                                            error={!!errors?.colorCategory}
                                            helperText={errors?.colorCategory?.message}
                                            label='Color'
                                            type='color'
                                            defaultValue='#000000'
                                            {...register('colorCategory')}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <Button
                                        variant='outlined'
                                        sx={addPillSx}
                                        startIcon={<AddCircleOutline sx={{ fontSize: 18 }} />}
                                        onClick={addCategory}
                                    >
                                        Agregar categoría
                                    </Button>
                                </div>
                            </Box>

                            <Box sx={sectionSx}>
                                <SectionTitle
                                    right={
                                        <span className='text-[11px] font-semibold text-slate-500 dark:text-gray-400'>
                                            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
                                        </span>
                                    }
                                >
                                    Categorías del gráfico
                                </SectionTitle>
                                {categories.length === 0 ? (
                                    <div className='text-center text-xs text-slate-500 dark:text-gray-400 py-4'>
                                        Aún no agregaste categorías.
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-1.5'>
                                        {categories.map((item) => (
                                            <div
                                                key={item.value}
                                                className='flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[rgba(15,42,68,0.08)] dark:border-white/5 bg-white dark:bg-slate-800/40'
                                            >
                                                <div className='flex items-center gap-2.5 min-w-0'>
                                                    <span
                                                        className='inline-block w-3.5 h-3.5 rounded-full shrink-0 shadow-[0_0_0_2px_rgba(15,42,68,0.06)]'
                                                        style={{ backgroundColor: item.itemStyle?.color }}
                                                    />
                                                    <span className='text-sm text-slate-700 dark:text-gray-200 truncate'>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <IconButton
                                                    onClick={() => removeCategory(item.value)}
                                                    size='small'
                                                    sx={{ color: '#b91c1c' }}
                                                >
                                                    <DeleteIcon fontSize='small' />
                                                </IconButton>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Box>

                            <div className='flex justify-end pt-1'>
                                <Button
                                    type='button'
                                    variant='contained'
                                    disableElevation
                                    sx={primaryPillSx}
                                    startIcon={<SaveOutlined sx={{ fontSize: 18 }} />}
                                    onClick={send}
                                >
                                    Guardar gráfico
                                </Button>
                            </div>
                        </div>

                        <div className='w-full lg:w-5/12'>
                            <Box sx={{ ...previewCardSx, minHeight: 340 }}>
                                <div className='px-3 py-1.5 bg-[#2c6aa0] dark:bg-[#1f4e79] border-b border-white/10'>
                                    <h2 className='text-[11px] font-semibold uppercase tracking-[0.08em] text-center text-white line-clamp-2'>
                                        {title || 'Vista previa'}
                                    </h2>
                                </div>
                                <div className='flex-1 p-3'>
                                    <div className='h-80'>
                                        <DoughnutChart data={categories} />
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </form>
                </Box>
            </Container>
        </VarsProvider>
    )
}

export default ConfigPie
