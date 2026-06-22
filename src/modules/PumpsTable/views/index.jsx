import React, { useEffect, useRef } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import InfoCard from '../components/InfoCard'
import PageHeader from '../../../components/PageHeader'

// Etiqueta de la columna "Control" según el tipo de control del equipo
const CONTROL_LABELS = {
  bomb: 'ON / OFF',
  osmosis_onoff: 'ON / OFF',
  comm_restart: 'Reinicio comunicación',
  timed_reboot: 'Reinicio temporizado',
}

// Paleta del proyecto, usada como acentos por sección
const ACCENT = { bombas: '#368bed', controles: '#d8621d' }

// --- Primitivos visuales del dashboard ---
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
  const v = ACTION_VARIANTS[variant] || ACTION_VARIANTS.green
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

// Título de cada sección: punto de acento + nombre + contador
const SectionTitle = ({ color, children, count }) => (
  <Box className="flex items-center gap-2.5">
    <span
      className="inline-block rounded-full"
      style={{ width: 11, height: 11, background: color, boxShadow: `0 0 0 4px ${color}26` }}
    />
    <span className="text-lg font-bold tracking-tight text-gray-800 dark:text-gray-100">
      {children}
    </span>
    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
      {count}
    </span>
  </Box>
)

// Estilos compartidos de los desplegables (look limpio, sin sombra/divisor de MUI)
const accordionSx = {
  borderRadius: '18px',
  boxShadow: 'none',
  '&:before': { display: 'none' },
}
const summarySx = {
  px: 2,
  minHeight: 0,
  borderRadius: '18px',
  '& .MuiAccordionSummary-content': { my: 1.25 },
}
const detailsSx = { p: { xs: 0.75, sm: 1 }, pt: 0 }

const PumpsTable = () => {
  const [listpumps, setListPumps] = useState([])
  const [infoSuccion, setInfoSuccion] = useState([])
  const [bombColumns, setBombColumns] = useState([])
  const [commandColumns, setCommandColumns] = useState([])
  const [loading, setLoading] = useState(true)

  // Ventana de gracia tras una acción: durante este lapso el poll NO pisa la fila
  // con el dato de Influx (atrasado ~1 min). Keyed por id de equipo -> timestamp de
  // expiración. El PLC publica a Influx ~cada 1 min, así que 90s da margen.
  const pendingRef = useRef({})
  const PENDING_MS = 90000

  const getActionIdByName = (actions, name) =>
    actions?.find(a => a.name === name)?.id

  const fetchPumps = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    try {
      setLoading(true)

      const { data } = await request(`${url}/bombs_PLC`, 'GET')
      setInfoSuccion(data.info_succion)
      setListPumps(data.bombs)

      // --- Celdas reutilizables entre ambas tablas ---
      const nameCell = ({ row }) => (
        <span className='font-semibold text-slate-800 dark:text-gray-100'>{row.original.name}</span>
      )

      const controlCell = ({ row }) => {
        const label = CONTROL_LABELS[row.original.control_type] || 'ON / OFF'
        return <StatusChip label={label} tone="neutral" />
      }

      const statusCell = ({ row }) => {
        const r = row.original
        const { control_type } = r

        if (control_type === 'comm_restart') {
          return r.comm_ok === true
            ? <StatusChip label="Comunicación OK" tone="success" pulse />
            : <StatusChip label="Sin datos" tone="error" />
        }

        if (control_type === 'timed_reboot') {
          // El toggle real del reinicio automático es la fila sintética (id null).
          // Otros equipos marcados timed_reboot (ej. pulso de limpieza) no tienen estado on/off.
          if (r.id == null) {
            if (r.status === 1) return <StatusChip label="Activa" tone="success" pulse />
            if (r.status === 2) return <StatusChip label="En proceso" tone="warning" />
            return <StatusChip label="Apagada" tone="neutral" />
          }
          return <span>-</span>
        }

        if (control_type === 'osmosis_onoff') {
          // El back manda la etiqueta del estado actual (ej. "Cisterna", "Habilitado", "Encendida")
          let label = 'Sin datos'
          let tone = 'warning'
          if (r.status_label) {
            label = r.status_label
            tone = r.status === true ? 'success' : 'neutral'
          } else if (r.status === true) {
            label = 'Encendida'
            tone = 'success'
          } else if (r.status === false) {
            label = 'Apagada'
            tone = 'neutral'
          }

          return (
            <Box display="flex" gap={1} alignItems="center">
              <StatusChip label={label} tone={tone} pulse={tone === 'success'} />
              {r.enabled === false && <StatusChip label="No habilitado" tone="error" />}
            </Box>
          )
        }

        // bomb
        if (r.status === true) return <StatusChip label="En Marcha" tone="success" pulse />
        if (r.status === false) return <StatusChip label="Apagada" tone="neutral" />
        return <StatusChip label="Sin datos" tone="warning" />
      }

      const modeCell = ({ row }) => {
        const r = row.original

        // Solo las bombas tienen modo de operación (Automático / forzado)
        if (r.control_type !== 'bomb') return <span>-</span>

        switch (r.actual_mode) {
          case 'Automático':
            return <StatusChip label="Automático" tone="warning" />
          case 'Encendido forzado':
            return <StatusChip label="Encendido forzado" tone="success" />
          case 'Apagado forzado':
            return <StatusChip label="Apagado forzado" tone="error" />
          default:
            return <StatusChip label="Sin datos" tone="neutral" />
        }
      }

      const actionsCell = ({ row }) => {
        const r = row.original
        const { control_type } = r

        // Reinicio temporizado REAL (fila sintética OI-50, id null): toggle Iniciar/Detener
        if (control_type === 'timed_reboot' && r.id == null) {
          const isActive = r.status !== 0 // 0 = apagada; 1 o 2 = activa/en proceso
          return (
            <Box display="flex" gap={0.75}>
              <ActionPill
                label={isActive ? 'Detener' : 'Iniciar'}
                variant={isActive ? 'red' : 'green'}
                onClick={() => sendAction(r, isActive ? 'OFF' : 'ON')}
              />
            </Box>
          )
        }

        // Reinicio de comunicación: único botón, habilitado solo si NO hay datos
        if (control_type === 'comm_restart') {
          const action = r.actions?.[0]
          return (
            <Box display="flex" gap={0.75}>
              <ActionPill
                label="Reiniciar"
                variant="amber"
                disabled={r.comm_ok !== false || !action}
                onClick={() => action && sendAction(r, action.name)}
              />
            </Box>
          )
        }

        // Osmosis ON/OFF (toggle genérico de 2 estados): un botón por cada acción real.
        // Cubre ON/OFF, Habilitado/Deshabilitado, Cisterna/Alcantarilla, etc.
        if (control_type === 'osmosis_onoff') {
          const notEnabled = r.enabled === false
          // ¿Esta acción es el estado actual? -> se deshabilita (no tiene sentido re-enviarla)
          const isCurrentState = (a) => {
            if (r.status_label && a.name === r.status_label) return true // genérico (label === nombre de acción)
            if (a.name === 'ON' && r.status === true) return true        // fallback ON/OFF osmosis
            if (a.name === 'OFF' && r.status === false) return true
            return false
          }
          const actions = r.actions?.filter(a => a.name !== 'Leer') ?? []
          return (
            <Box display="flex" gap={0.75}>
              {actions.map((a, i) => (
                <ActionPill
                  key={a.id}
                  label={a.name}
                  variant={i === 0 ? 'green' : 'red'}
                  disabled={notEnabled || isCurrentState(a)}
                  onClick={() => sendAction(r, a.name)}
                />
              ))}
            </Box>
          )
        }

        // Otros equipos marcados timed_reboot con acciones reales (ej. "Pulso post alarma"):
        // se comportan como un pulso PLC normal → un botón por acción.
        if (control_type === 'timed_reboot') {
          return (
            <Box display="flex" gap={0.75}>
              {r.actions?.map((a) => (
                <ActionPill
                  key={a.id}
                  label={a.name}
                  variant="amber"
                  onClick={() => sendAction(r, a.name)}
                />
              ))}
            </Box>
          )
        }

        // bomb (comportamiento original): AUTO / ON / OFF según modo
        const isWithoutData = r.actual_mode === 'Sin datos'
        const isAutomatic = r.actual_mode === 'Automático'

        return (
          <Box display="flex" gap={0.75}>
            <ActionPill
              label="AUTO"
              variant="amber"
              disabled={isWithoutData || isAutomatic}
              onClick={() => sendAction(r, 'AUTO')}
            />
            <ActionPill
              label="ON"
              variant="green"
              disabled={isWithoutData || !isAutomatic}
              onClick={() => sendAction(r, 'ON')}
            />
            <ActionPill
              label="OFF"
              variant="red"
              disabled={isWithoutData || !isAutomatic}
              onClick={() => sendAction(r, 'OFF')}
            />
          </Box>
        )
      }

      // --- Dos tablas: bombas vs comandos (osmosis / comunicación / reinicio) ---
      const nameColumn = { header: 'Equipo', accessorKey: 'name', Cell: nameCell }
      const statusColumn = { header: 'Estado', accessorKey: 'status', Cell: statusCell }
      const actionsColumn = { header: 'Acciones', accessorKey: 'actions', Cell: actionsCell }

      setBombColumns([
        nameColumn,
        statusColumn,
        { header: 'Modo Actual', accessorKey: 'actual_mode', Cell: modeCell },
        actionsColumn,
      ])

      setCommandColumns([
        nameColumn,
        { header: 'Control', accessorKey: 'control_type', Cell: controlCell },
        statusColumn,
        actionsColumn,
      ])

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

      const now = Date.now()

      setListPumps(prev =>
        prev.map(row => {
          // Ventana de gracia: la acción es reciente e Influx aún no publicó el
          // valor nuevo. No pisamos la fila hasta que expire.
          const until = pendingRef.current[row.id]
          if (until != null) {
            if (now < until) return row
            delete pendingRef.current[row.id]
          }

          switch (row.control_type) {
            case 'comm_restart':
              return { ...row, comm_ok: data.comm_ok ?? row.comm_ok }
            case 'timed_reboot':
              // Solo la fila sintética (id null) tiene estado de toggle refrescable.
              if (row.id == null) {
                return { ...row, status: data.timed_reboot?.status ?? row.status }
              }
              return row
            case 'osmosis_onoff': {
              // Estado por equipo, keyed por id (data_bombeo.osmosis_equipos[row.id]).
              const eq = data.osmosis_equipos?.[row.id]
              if (eq) {
                return {
                  ...row,
                  status: eq.status,
                  status_label: eq.status_label,
                  enabled: eq.enabled,
                }
              }
              return row
            }
            case 'bomb':
            default:
              return {
                ...row,
                status: data.bombas?.[row.name] ?? null,
                actual_mode: data.modos?.[row.name] ?? null,
              }
          }
        })
      )
      setInfoSuccion(data.info_succion)
    } catch (error) {
      console.error(error)
    }
  }

  //FUNCION PARA ENVIAR ACCION A UN EQUIPO (rutea según el equipo)
  const sendAction = async (row, actionName) => {
    const url = backend[import.meta.env.VITE_APP_NAME]

    // El toggle del reinicio automático es la fila sintética (id null);
    // el resto (incluido un timed_reboot con acciones reales) ejecuta vía PLC.
    const isAutoReboot = row.control_type === 'timed_reboot' && row.id == null

    // Mensaje de confirmación según el tipo de equipo
    let title = `¿Desea ejecutar "${actionName}" en ${row.name}?`
    if (isAutoReboot) {
      title = actionName === 'ON'
        ? '¿Desea activar el reinicio automático de la osmosis?'
        : '¿Desea desactivar el reinicio automático de la osmosis?'
    } else if (row.control_type === 'comm_restart') {
      title = '¿Desea reiniciar la comunicación (MQTT)?'
    } else if (row.control_type === 'bomb') {
      title = '¿Desea cambiar el modo actual de la bomba?'
    } else if (row.control_type === 'osmosis_onoff') {
      title = `¿Desea cambiar "${row.name}" a "${actionName}"?`
    }

    const result = await Swal.fire({
      icon: 'warning',
      title,
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      let executeData = null

      if (isAutoReboot) {
        // Reinicio temporizado: toggle persistido, NO pega a /bombs_PLC/execute
        const status = actionName === 'ON' ? 1 : 0
        await request(`${url}/osmosis/auto-reboot`, 'POST', { status })
      } else {
        // bomb / osmosis_onoff / comm_restart / pulso: comando PLC vía execute
        const actionId = getActionIdByName(row.actions, actionName)

        if (!actionId) {
          Swal.fire({
            icon: 'warning',
            text: `Acción ${actionName} no disponible`,
          })
          return
        }

        const { data } = await request(`${url}/bombs_PLC/execute`, 'POST', {
          bombId: row.id,
          actionId,
        })
        executeData = data
      }

      Swal.fire({
        icon: 'success',
        title: 'Acción enviada',
        text: 'En breve verás el cambio reflejado',
        timer: 1500,
        showConfirmButton: false,
      })

      const isBomb = row.control_type === 'bomb' || !row.control_type

      // Influx se alimenta por MQTT (~1 min), así que un refresh inmediato leería
      // el estado viejo. Reflejamos el cambio en el acto y dejamos que el poll de
      // 30s reconcilie el status físico (sobre todo en AUTO).
      if (executeData?.liveStatus) {
        // Estado real confirmado por el PLC en vivo.
        const live = executeData.liveStatus
        // Protegemos la fila del poll hasta que Influx publique el valor nuevo.
        pendingRef.current[row.id] = Date.now() + PENDING_MS
        setListPumps(prev =>
          prev.map(p =>
            p.id === row.id
              ? {
                  ...p,
                  actual_mode: live.actual_mode ?? p.actual_mode,
                  // status solo si el back lo manda (ON/OFF); en AUTO lo define Influx
                  ...(typeof live.status === 'boolean' ? { status: live.status } : {}),
                }
              : p
          )
        )
      } else if (isBomb) {
        // Fallback optimista (Capa 1): el back no devolvió liveStatus
        // (ej. equipos de Castelli o lectura del PLC fallida).
        const optimistic = {
          ON: { status: true, actual_mode: 'Encendido forzado' },
          OFF: { status: false, actual_mode: 'Apagado forzado' },
          AUTO: { actual_mode: 'Automático' }, // status lo define el PLC; no tocar
        }[actionName] || {}
        // Protegemos la fila del poll hasta que Influx publique el valor nuevo.
        pendingRef.current[row.id] = Date.now() + PENDING_MS
        setListPumps(prev =>
          prev.map(p => (p.id === row.id ? { ...p, ...optimistic } : p))
        )
      } else {
        // osmosis_onoff / comm_restart / timed_reboot: comportamiento actual.
        refreshBombStatus()
      }
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

  const bombs = listpumps.filter(p => !p.control_type || p.control_type === 'bomb')
  const commands = listpumps.filter(p => p.control_type && p.control_type !== 'bomb')

  const tableProps = {
    pagination: true,
    pageSize: 50,
    density: 'compact',
  }

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

          {/* Desplegable — Bombas */}
          <Accordion
            defaultExpanded
            disableGutters
            sx={accordionSx}
            className="!bg-transparent border border-gray-200 dark:border-gray-700 overflow-hidden mb-3"
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <SectionTitle color={ACCENT.bombas} count={bombs.length}>Bombas</SectionTitle>
            </AccordionSummary>
            <AccordionDetails sx={detailsSx}>
              <TableCustom columns={bombColumns} data={bombs} {...tableProps} />
            </AccordionDetails>
          </Accordion>

          {/* Desplegable — Controles (osmosis / comunicación / reinicio) */}
          <Accordion
            defaultExpanded
            disableGutters
            sx={accordionSx}
            className="!bg-transparent border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <SectionTitle color={ACCENT.controles} count={commands.length}>Controles</SectionTitle>
            </AccordionSummary>
            <AccordionDetails sx={detailsSx}>
              <TableCustom columns={commandColumns} data={commands} {...tableProps} />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Container>
  )
}

export default PumpsTable
