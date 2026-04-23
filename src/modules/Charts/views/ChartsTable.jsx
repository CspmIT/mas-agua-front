import React, { useEffect, useMemo, useState } from 'react'
import { request } from '../../../utils/js/request'
import { configs } from '../configs/configs'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import {
  Container, FormControl, InputLabel, MenuItem, Select,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Controller, useForm } from 'react-hook-form'
import { storage } from '../../../storage/storage'
import AssignChartDialog from '../components/AssignChartDialog'
import AssignProfileDialog from '../components/AssignProfileDialog'
import PageHeader from '../../../components/PageHeader'
import FiltersBar from '../../../components/FiltersBar'
import { ActionsRow, EditChip, StatusPill, StatusToggleChip, ToneChip } from '../../../components/TableActions'

const EXCLUDED_DASHBOARD_TYPES = ['TotalizadoPeriodo', 'LineChart', 'BoardChart']

const ChartsTable = () => {
  const usuario = storage.get('usuario')
  const isSuperAdmin = usuario?.profile === 4
  const navigate = useNavigate()
  const [charts, setCharts] = useState([])
  const [chartsOriginal, setChartsOriginal] = useState([])
  const [columnsTable, setColumnsTable] = useState([])
  const [loader, setLoader] = useState(true)
  const [users, setUsers] = useState([])
  const [assignDialog, setAssignDialog] = useState({ open: false, chartId: null })
  const [profileDialog, setProfileDialog] = useState({ open: false, chartId: null })
  const [profiles, setProfiles] = useState([])

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      type: '',
      status: '',
      profile: '',
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
      { header: 'ID', accessorKey: 'id', size: 25 },
      { header: 'Titulo', accessorKey: 'name', size: 275 },
      { header: 'Tipo', accessorKey: 'type' },
      {
        header: 'Estado',
        accessorKey: 'status',
        size: 50,
        Cell: ({ row }) => <StatusPill active={!!row.original.status} />,
      },
      {
        header: 'Acciones',
        accessorKey: 'actions',
        Cell: ({ row }) => (
          <ActionsRow>
            <EditChip
              disabled={row.original.type === 'PumpControl'}
              onClick={() => {
                const type = row.original.type
                if (type === 'BooleanChart') { navigate(`/config/graphic/boolean/${row.original.id}`); return }
                if (type === 'MultipleBooleanChart') { navigate(`/config/graphic/multipleBoolean/${row.original.id}`); return }
                if (type === 'PumpControl') { navigate('/config/pumps'); return }
                if (type === 'BoardChart') { navigate(`/config/graphic/board/${row.original.id}`); return }

                const matchingConfig = Object.values(configs).find(
                  (config) => config.typeGraph === type
                )
                navigate(`/config/graphic/${matchingConfig.id}/${row.original.id}`)
              }}
            />

            <StatusToggleChip
              active={!!row.original.status}
              onClick={async (e) => {
                e.preventDefault()
                const url = backend[import.meta.env.VITE_APP_NAME]

                const question = await Swal.fire({
                  icon: 'question',
                  html: `Esta seguro que desea ${row.original.status ? 'desactivar' : 'activar'} este grafico?`,
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
                    await Swal.fire({ icon: 'success', html: 'Grafico actualizado correctamente' })
                    setChartsOriginal((prev) => prev.map((c) =>
                      c.id === row.original.id ? { ...c, status: !c.status } : c
                    ))
                    setCharts((prev) => prev.map((c) =>
                      c.id === row.original.id ? { ...c, status: !c.status } : c
                    ))
                  }
                } catch (error) {
                  console.error(error)
                  Swal.fire({ icon: 'error', html: 'No se pudo actualizar el grafico' })
                }
              }}
            />

            {!!row.original.status && !EXCLUDED_DASHBOARD_TYPES.includes(row.original.type) && (
              <ToneChip
                tone='accent'
                onClick={() => setAssignDialog({ open: true, chartId: row.original.id })}
              >
                Usuarios
              </ToneChip>
            )}

            {!!row.original.status && (
              <ToneChip
                tone='info'
                onClick={() => setProfileDialog({ open: true, chartId: row.original.id })}
              >
                Perfiles
              </ToneChip>
            )}
          </ActionsRow>
        ),
      },
    ]
    setColumnsTable(columnsCel)
    setChartsOriginal(data)
    setCharts(data)
    setLoader(false)
  }

  const onSubmit = ({ type, status, profile }) => {
    let filtered = [...chartsOriginal]
    if (type) filtered = filtered.filter((c) => c.type === type)
    if (status === '1') filtered = filtered.filter((c) => c.status === 1)
    else if (status === '0') filtered = filtered.filter((c) => c.status === 0)
    if (profile) {
      filtered = filtered.filter((c) =>
        c.ChartProfiles?.some(cp => String(cp.profile_id) === String(profile))
      )
    }
    setCharts(filtered)
  }

  const onResetFilters = () => {
    reset({ type: '', status: '', profile: '' })
    setCharts(chartsOriginal)
  }

  const fetchUsers = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    const { data } = await request(`${url}/admin/users`, 'GET')
    setUsers(data)
  }

  const fetchProfiles = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]
    const { data } = await request(`${url}/listProfiles`, 'GET')
    setProfiles(data)
  }

  useEffect(() => {
    fetchCharts()
    fetchProfiles()
    if (isSuperAdmin) fetchUsers()
  }, [])

  return (
    <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
      <PageHeader
        title='Gráficos'
        createLabel='Crear gráfico'
        onCreate={() => navigate('/config/graphic')}
      />

      {!loader ? (
        <>
          <FiltersBar
            onFilter={handleSubmit(onSubmit)}
            onReset={onResetFilters}
          >
            <div className='flex-1 min-w-[180px]'>
              <FormControl fullWidth size='small'>
                <InputLabel id='type_label'>Tipo</InputLabel>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId='type_label' label='Tipo'>
                      <MenuItem value=''>Todos</MenuItem>
                      {typeList.map((t, i) => (
                        <MenuItem key={i} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </div>

            <div className='flex-1 min-w-[180px]'>
              <FormControl fullWidth size='small'>
                <InputLabel id='status_label'>Estado</InputLabel>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId='status_label' label='Estado'>
                      <MenuItem value=''>Todos</MenuItem>
                      <MenuItem value='1'>Activos</MenuItem>
                      <MenuItem value='0'>Inactivos</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </div>

            <div className='flex-1 min-w-[180px]'>
              <FormControl fullWidth size='small'>
                <InputLabel id='profile_label'>Perfil</InputLabel>
                <Controller
                  name='profile'
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId='profile_label' label='Perfil'>
                      <MenuItem value=''>Todos</MenuItem>
                      {profiles.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.description}</MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </div>
          </FiltersBar>

          <TableCustom
            columns={columnsTable}
            data={charts.length > 0 ? charts : []}
            pagination={true}
            pageSize={10}
            topToolbar={true}
          />

          <AssignChartDialog
            open={assignDialog.open}
            chartId={assignDialog.chartId}
            users={users}
            onClose={() => setAssignDialog({ open: false, chartId: null })}
          />
          <AssignProfileDialog
            open={profileDialog.open}
            chartId={profileDialog.chartId}
            onClose={() => setProfileDialog({ open: false, chartId: null })}
          />
        </>
      ) : (
        <LoaderComponent />
      )}
    </Container>
  )
}

export default ChartsTable
