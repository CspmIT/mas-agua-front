import React, { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, Container } from '@mui/material'
import { useState } from 'react'
import InfoCard from '../components/InfoCard'
import PageHeader from '../../../components/PageHeader'

const STATUS_TONES = {
  success: { bg: 'rgba(16, 185, 129, 0.14)', text: '#065f46', dot: '#10b981', dBg: 'rgba(16, 185, 129, 0.22)', dText: '#6ee7b7' },
  neutral: { bg: 'rgba(148, 163, 184, 0.2)', text: '#334155', dot: '#64748b', dBg: 'rgba(148, 163, 184, 0.25)', dText: '#cbd5e1' },
  warning: { bg: 'rgba(216, 98, 29, 0.14)', text: '#7c2d12', dot: '#d8621d', dBg: 'rgba(251, 146, 60, 0.22)', dText: '#fdba74' },
  error: { bg: 'rgba(225, 29, 72, 0.14)', text: '#881337', dot: '#e11d48', dBg: 'rgba(244, 63, 94, 0.22)', dText: '#fca5a5' },
}

const StatusChip = ({ label, tone = 'neutral', pulse = false }) => {
  const c = STATUS_TONES[tone] || STATUS_TONES.neutral
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.9,
        px: 1.5,
        py: 0.5,
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        backgroundColor: c.bg,
        color: c.text,
        'body.dark &': { backgroundColor: c.dBg, color: c.dText },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: c.dot,
          flexShrink: 0,
          ...(pulse && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: c.dot,
              animation: 'statusPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            '@keyframes statusPing': {
              '0%': { transform: 'scale(1)', opacity: 0.55 },
              '100%': { transform: 'scale(2.6)', opacity: 0 },
            },
          }),
        }}
      />
      {label}
    </Box>
  )
}

const ACTION_VARIANTS = {
  amber: { bg: '#d8621d', hover: '#b94f15', shadow: 'rgba(216, 98, 29, 0.4)' },
  green: { bg: '#10b981', hover: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
  red: { bg: '#e11d48', hover: '#be123c', shadow: 'rgba(225, 29, 72, 0.4)' },
}

const ActionPill = ({ label, variant, disabled, onClick }) => {
  const v = ACTION_VARIANTS[variant]
  return (
    <Button
      size='small'
      disabled={disabled}
      onClick={onClick}
      disableElevation
      sx={{
        minWidth: 54,
        borderRadius: '999px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.72rem',
        letterSpacing: '0.06em',
        px: 1.75,
        py: 0.6,
        color: '#ffffff',
        backgroundColor: v.bg,
        boxShadow: `0 2px 8px ${v.shadow}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: v.hover,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${v.shadow}`,
        },
        '&:active': { transform: 'translateY(0)' },
        '&.Mui-disabled': {
          backgroundColor: 'rgba(148, 163, 184, 0.18)',
          color: 'rgba(100, 116, 139, 0.55)',
          boxShadow: 'none',
        },
        'body.dark &.Mui-disabled': {
          backgroundColor: 'rgba(75, 85, 99, 0.3)',
          color: 'rgba(156, 163, 175, 0.45)',
        },
      }}
    >
      {label}
    </Button>
  )
}

const PumpsTable = () => {
  const [listpumps, setListPumps] = useState([])
  const [infoSuccion, setInfoSuccion] = useState([])
  const [columnsTable, setColumnsTable] = useState([])
  const [loading, setLoading] = useState(true)
  
  const getActionIdByName = (actions, name) =>
    actions?.find(a => a.name === name)?.id

  const fetchPumps = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    try {
      setLoading(true)

      const { data } = await request(`${url}/bombs_PLC`, 'GET')
      setInfoSuccion(data.info_succion)
      setListPumps(data.bombs)

      const columns = [
        {
          header: 'Bomba',
          accessorKey: 'name',
          Cell: ({ row }) => (
            <span className='font-semibold text-slate-800 dark:text-gray-100'>{row.original.name}</span>
          ),
        },
        {
          header: 'Estado',
          accessorKey: 'status',
          Cell: ({ row }) => {
            const status = row.original.status
            if (status === true) return <StatusChip label='En marcha' tone='success' pulse />
            if (status === false) return <StatusChip label='Apagada' tone='neutral' />
            return <StatusChip label='Sin datos' tone='warning' />
          },
        },
        {
          header: 'Modo Actual',
          accessorKey: 'actual_mode',
          Cell: ({ row }) => {
            const mode = row.original.actual_mode
            switch (mode) {
              case 'Automático':
                return <StatusChip label='Automático' tone='warning' />
              case 'Encendido forzado':
                return <StatusChip label='Encendido forzado' tone='success' />
              case 'Apagado forzado':
                return <StatusChip label='Apagado forzado' tone='error' />
              default:
                return <StatusChip label='Sin datos' tone='neutral' />
            }
          },
        },
        {
          header: 'Acciones',
          accessorKey: 'actions',
          Cell: ({ row }) => {
            const { id: bombId, actual_mode, actions } = row.original
            const isWithoutData = actual_mode === 'Sin datos'
            const isAutomatic = actual_mode === 'Automático'

            const handleAction = (actionName) => {
              const actionId = getActionIdByName(actions, actionName)

              if (!actionId) {
                Swal.fire({ icon: 'warning', text: `Acción ${actionName} no disponible` })
                return
              }
              sendBombAction({ bombId, actionId })
            }

            return (
              <Box display='flex' gap={0.75}>
                <ActionPill
                  label='AUTO'
                  variant='amber'
                  disabled={isWithoutData || isAutomatic}
                  onClick={() => handleAction('AUTO')}
                />
                <ActionPill
                  label='ON'
                  variant='green'
                  disabled={isWithoutData || !isAutomatic}
                  onClick={() => handleAction('ON')}
                />
                <ActionPill
                  label='OFF'
                  variant='red'
                  disabled={isWithoutData || !isAutomatic}
                  onClick={() => handleAction('OFF')}
                />
              </Box>
            )
          },
        }
      ]

      setColumnsTable(columns)

    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        text: 'No se pudieron obtener los datos de las bombas',
      })
    } finally {
      setLoading(false)
    }
  }

  //FUNCION PARA CONSULTAR ESTADO DE LA BOMBA
  const refreshBombStatus = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    try {
      const { data } = await request(`${url}/data_bombeo`, 'GET')

      setListPumps(prev =>
        prev.map(bomb => ({
          ...bomb,
          status: data.bombas[bomb.name] ?? null,
          actual_mode: data.modos[bomb.name] ?? null
        }))
      )
      setInfoSuccion(data.info_succion)
    } catch (error) {
      console.error(error)
    }
  }

  //FUNCION PARA ENVIAR ACCION A LA BOMBA
  const sendBombAction = async ({ bombId, actionId }) => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Desea cambiar el modo actual de la bomba?',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
  
    if (!result.isConfirmed) return

    try {
      await request(`${url}/bombs_PLC/execute`, 'POST', {
        bombId,
        actionId,
      })
      
      Swal.fire({
        icon: 'success',
        title: 'Acción enviada',
        text: 'En breve verás el cambio reflejado',
        
        timer: 1500,
        showConfirmButton: false,
      })

      refreshBombStatus()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        text: 'No se pudo enviar la acción',
      })
    }
  }

  useEffect(() => {
    fetchPumps();

    const interval = setInterval(() => {
      refreshBombStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
      {loading ? (
        <LoaderComponent />
      ) : (
        <>
          <PageHeader title='Bombeo de succión' />

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5'>
            <InfoCard index={0} label='Estado' value={infoSuccion.var_2} color='green' />
            <InfoCard index={1} label='Destino' value={infoSuccion.Destino} color='blue' />
            <InfoCard index={2} label='Configuración' value={infoSuccion.Configuracion} color='indigo' />
            <InfoCard index={3} label='Activaciones manuales' value={infoSuccion.AcM || '-'} color='orange' />
            <InfoCard index={4} label='Fuera de servicio' value={infoSuccion.FuS || '-'} color='red' />
          </div>

          <TableCustom
            columns={columnsTable}
            data={listpumps.length ? listpumps : []}
            pagination={true}
            pageSize={30}
            density='compact'
          />
        </>
      )}
    </Container>
  )
}

export default PumpsTable