import React, { useEffect, useMemo, useState } from 'react'
import { request } from '../../../utils/js/request'
import { configs } from '../configs/configs'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import CardCustom from '../../../components/CardCustom'
import { Controller, useForm } from 'react-hook-form'

const ChartsTable = () => {
  const navigate = useNavigate()
  const [charts, setCharts] = useState([])
  const [chartsOriginal, setChartsOriginal] = useState([])
  const [columnsTable, setColumnsTable] = useState([])
  const [loader, setLoader] = useState(true)
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      type: '',
      status: '',
    },
  })

  const typeList = useMemo(() => {
    const unique = [...new Set(chartsOriginal.map((c) => c.type).filter(Boolean))]
    unique.sort()
    return unique
  }, [chartsOriginal])

  const fetchCharts = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    const endpoint = url + '/allCharts'
    const { data } = await request(endpoint, 'GET')

    const columnsCel = [
      {
        header: 'ID',
        accessorKey: 'id',
        size: 75
      },
      {
        header: 'Titulo',
        accessorKey: 'name',
        size: 300
      },
      {
        header: 'Tipo',
        accessorKey: 'type',
      },
      {
        header: 'Orden',
        accessorKey: 'order',
      },
      {
        header: 'Estado',
        accessorKey: 'status',
        Cell: ({ row }) => {
          const isActive = row.original.status
      
          return (
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                color: isActive ? 'success.main' : 'error.main',
              }}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </Typography>
          )
        },
      },      
      {
        header: 'Acciones',
        accessorKey: 'actions',
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <Button
              disabled={row.original.type === 'PumpControl'}
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                const type = row.original.type

                if (type === 'BooleanChart') {
                  navigate(`/config/graphic/boolean/${row.original.id}`)
                  return
                }
                if (type === 'MultipleBooleanChart') {
                  navigate(`/config/graphic/multipleBoolean/${row.original.id}`)
                  return
                }
                if (type === 'PumpControl') {
                  navigate('/config/pumps')
                  return
                }
                if (type === 'BoardChart') {
                  navigate(`/config/graphic/board/${row.original.id}`)
                  return
                }

                const matchingConfig = Object.values(configs).find(
                  (config) => config.typeGraph === type
                )

                navigate(`/config/graphic/${matchingConfig.id}/${row.original.id}`)
              }}
            >
              Editar
            </Button>

            <Button
              variant="outlined"
              color={row.original.status ? 'error' : 'success'}
              size="small"
              onClick={async (e) => {
                e.preventDefault()

                const url = backend[import.meta.env.VITE_APP_NAME]

                const question = await Swal.fire({
                  icon: 'question',
                  html: `Esta seguro que desea ${
                    row.original.status ? 'desactivar' : 'activar'
                  } este grafico?`,
                  showCancelButton: true,
                  cancelButtonText: 'Cancelar',
                  confirmButtonText: row.original.status ? 'Desactivar' : 'Activar',
                })

                if (!question.isConfirmed) return

                const endpoint = `${url}/charts/status`

                try {
                  const { data } = await request(endpoint, 'PUT', {
                    id: row.original.id,
                    status: row.original.status,
                  })

                  if (data) {
                    await Swal.fire({
                      icon: 'success',
                      html: 'Grafico actualizado correctamente',
                    })

                    setChartsOriginal((prev) =>
                      prev.map((chart) =>
                        chart.id === row.original.id
                          ? { ...chart, status: !chart.status }
                          : chart
                      )
                    )

                    setCharts((prev) =>
                      prev.map((chart) =>
                        chart.id === row.original.id
                          ? { ...chart, status: !chart.status }
                          : chart
                      )
                    )
                  }
                } catch (error) {
                  console.error(error)
                  Swal.fire({
                    icon: 'error',
                    html: 'No se pudo actualizar el grafico',
                  })
                }
              }}
            >
              {row.original.status ? 'Desactivar' : 'Activar'}
            </Button>
          </Box>
        ),
      },
    ]
    setColumnsTable(columnsCel)
    setChartsOriginal(data)
    setCharts(data)
    setLoader(false)
  }

  // FILTROS PARA TABLA
  const onSubmit = ({ type, status }) => {
    let filtered = [...chartsOriginal]

    if (type) {
      filtered = filtered.filter((c) => c.type === type)
    }

    if (status === "1") {
      filtered = filtered.filter((c) => c.status === 1)
    } else if (status === "0") {
      filtered = filtered.filter((c) => c.status === 0)
    }
    setCharts(filtered)
  }

  const onResetFilters = () => {
    reset({ type: '', status: '' })
    setCharts(chartsOriginal)
  }

  useEffect(() => {
    fetchCharts()
  }, [])

  return (
    <Container className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <Typography className="w-full text-center md:!ms-40" variant="h4" align="center">
          Gráficos
        </Typography>

        <div className="flex justify-center sm:justify-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/config/graphic')}
            className="sm:mx-10 whitespace-nowrap"
          >
            Crear grafico
          </Button>
        </div>
      </div>

      {!loader ? (
        <>
          <CardCustom className={'p-2 my-2 rounded-md bg-grey-100'}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap relative w-full justify-center items-end mt-1"
            >
              {/* TIPO */}
              <div className="md:w-1/4 p-1 w-full">
                <FormControl fullWidth size="small" className="shadow-sm">
                  <InputLabel id="type_label">Tipo</InputLabel>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="type_label" label="Tipo">
                        <MenuItem value="">Todos</MenuItem>
                        {typeList.map((t, i) => (
                          <MenuItem key={i} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              {/* ESTADO */}
              <div className="md:w-1/4 p-1 w-full">
                <FormControl fullWidth size="small" className="shadow-sm">
                  <InputLabel id="status_label">Estado</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="status_label" label="Estado">
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="1">Activos</MenuItem>
                        <MenuItem value="0">Inactivos</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              {/* BOTONES */}
              <div className="p-1 w-full justify-center flex gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  Filtrar
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={onResetFilters}
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </CardCustom>

          <TableCustom
            columns={columnsTable}
            data={charts.length > 0 ? charts : []}
            pagination={true}
            pageSize={10}
            topToolbar={true}
          />
        </>
      ) : (
        <LoaderComponent />
      )}
    </Container>
  )
}

export default ChartsTable
