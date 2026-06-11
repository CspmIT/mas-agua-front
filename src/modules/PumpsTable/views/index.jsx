import React, { useEffect } from 'react'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import TableCustom from '../../../components/TableCustom'
import Swal from 'sweetalert2'
import LoaderComponent from '../../../components/Loader'
import { Box, Button, Chip, FormLabel, getFormControlLabelUtilityClasses } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import { useState } from 'react'
import InfoCard from '../components/InfoCard'

// Etiqueta de la columna "Control" según el tipo de control del equipo
const CONTROL_LABELS = {
  bomb: 'ON / OFF',
  osmosis_onoff: 'ON / OFF',
  comm_restart: 'Reinicio comunicación',
  timed_reboot: 'Reinicio temporizado',
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
          header: 'Equipo',
          accessorKey: 'name',
        },
        {
          header: 'Control',
          accessorKey: 'control_type',
          Cell: ({ row }) => {
            const label = CONTROL_LABELS[row.original.control_type] || 'ON / OFF'

            return (
              <Chip
                label={label}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            )
          },
        },
        {
          header: 'Estado',
          accessorKey: 'status',
          Cell: ({ row }) => {
            const r = row.original
            const { control_type } = r

            let label = 'Sin datos'
            let color = 'warning'

            if (control_type === 'comm_restart') {
              if (r.comm_ok === true) {
                label = 'Comunicación OK'
                color = 'success'
              } else {
                label = 'Sin datos'
                color = 'error'
              }
            } else if (control_type === 'timed_reboot') {
              // El toggle real del reinicio automático es la fila sintética (id null).
              // Otros equipos marcados timed_reboot (ej. pulso de limpieza) no tienen estado on/off.
              if (r.id == null) {
                if (r.status === 1) {
                  label = 'Activa'
                  color = 'success'
                } else if (r.status === 2) {
                  label = 'En proceso'
                  color = 'warning'
                } else {
                  label = 'Apagada'
                  color = 'default'
                }
              } else {
                return <span>-</span>
              }
            } else if (control_type === 'osmosis_onoff') {
              if (r.status_label) {
                // El back manda la etiqueta del estado actual (ej. "Cisterna", "Habilitado", "Encendida")
                label = r.status_label
                color = r.status === true ? 'success' : 'primary'
              } else if (r.status === true) {
                label = 'Encendida'
                color = 'success'
              } else if (r.status === false) {
                label = 'Apagada'
                color = 'default'
              }

              return (
                <Box display="flex" gap={1} alignItems="center">
                  <Chip
                    label={label}
                    color={color}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                  {r.enabled === false && (
                    <Chip
                      label="No habilitado"
                      color="error"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </Box>
              )
            } else {
              // bomb
              if (r.status === true) {
                label = 'En Marcha'
                color = 'success'
              } else if (r.status === false) {
                label = 'Apagada'
                color = 'default'
              }
            }

            return (
              <Chip
                label={label}
                color={color}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            )
          },
        },
        {
          header: 'Modo Actual',
          accessorKey: 'actual_mode',
          Cell: ({ row }) => {
            const r = row.original

            // Solo las bombas tienen modo de operación (Automático / forzado)
            if (r.control_type !== 'bomb') {
              return <span>-</span>
            }

            const mode = r.actual_mode

            let color = 'default'
            let label = mode || 'Sin datos'

            switch (mode) {
              case 'Automático':
                color = 'warning'
                break
              case 'Encendido forzado':
                color = 'success'
                break
              case 'Apagado forzado':
                color = 'error'
                break
              default:
                color = 'primary'
                label = 'Sin datos'
                break
            }

            return (
              <Chip
                label={label}
                color={color}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            )
          },
        },
        {
          header: 'Acciones',
          accessorKey: 'actions',
          Cell: ({ row }) => {
            const r = row.original
            const { control_type } = r

            // Reinicio temporizado REAL (fila sintética OI-50, id null): toggle Iniciar/Detener
            if (control_type === 'timed_reboot' && r.id == null) {
              const isActive = r.status !== 0 // 0 = apagada; 1 o 2 = activa/en proceso
              return (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color={isActive ? 'error' : 'primary'}
                    size="small"
                    onClick={() => sendAction(r, isActive ? 'OFF' : 'ON')}
                  >
                    {isActive ? 'Detener' : 'Iniciar'}
                  </Button>
                </Box>
              )
            }

            // Reinicio de comunicación: único botón, habilitado solo si NO hay datos
            if (control_type === 'comm_restart') {
              const action = r.actions?.[0]
              return (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    disabled={r.comm_ok !== false || !action}
                    onClick={() => action && sendAction(r, action.name)}
                  >
                    Reiniciar
                  </Button>
                </Box>
              )
            }

            // Osmosis ON/OFF (toggle genérico de 2 estados): un botón por cada acción real.
            // Cubre ON/OFF, Habilitado/Deshabilitado, Cisterna/Alcantarilla, etc.
            if (control_type === 'osmosis_onoff') {
              const notEnabled = r.enabled === false
              return (
                <Box display="flex" gap={1}>
                  {r.actions?.map((a, i) => (
                    <Button
                      key={a.id}
                      variant="contained"
                      color={i === 0 ? 'success' : 'error'}
                      size="small"
                      disabled={notEnabled}
                      onClick={() => sendAction(r, a.name)}
                    >
                      {a.name}
                    </Button>
                  ))}
                </Box>
              )
            }

            // Otros equipos marcados timed_reboot con acciones reales (ej. "Pulso post alarma"):
            // se comportan como un pulso PLC normal → un botón por acción.
            if (control_type === 'timed_reboot') {
              return (
                <Box display="flex" gap={1}>
                  {r.actions?.map((a) => (
                    <Button
                      key={a.id}
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => sendAction(r, a.name)}
                    >
                      {a.name}
                    </Button>
                  ))}
                </Box>
              )
            }

            // bomb (comportamiento original): AUTO / ON / OFF según modo
            const isWithoutData = r.actual_mode === 'Sin datos'
            const isAutomatic = r.actual_mode === 'Automático'

            return (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  disabled={isWithoutData || isAutomatic}
                  onClick={() => sendAction(r, 'AUTO')}
                >
                  AUTO
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={isWithoutData || !isAutomatic}
                  onClick={() => sendAction(r, 'ON')}
                >
                  ON
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={isWithoutData || !isAutomatic}
                  onClick={() => sendAction(r, 'OFF')}
                >
                  OFF
                </Button>
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
        prev.map(row => {
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

        await request(`${url}/bombs_PLC/execute`, 'POST', {
          bombId: row.id,
          actionId,
        })
      }

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
    <div className="w-full">
      {loading ? (
        <LoaderComponent />
      ) : (
        <CardCustom className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-4 transition-all">

          {/* Header responsivo */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-gray-300 dark:border-gray-700 pb-3">
            <FormLabel className='w-full text-center !text-3xl'>
              Bombeo de succión
            </FormLabel>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <InfoCard
              label="Estado"
              value={infoSuccion.var_2}
              color="green"
            />
            <InfoCard
              label="Destino"
              value={infoSuccion.Destino}
              color="blue"
            />
            <InfoCard
              label="Configuración"
              value={infoSuccion.Configuracion}
              color="indigo"
            />
            <InfoCard
              label="Activaciones manuales"
              value={infoSuccion.AcM || '-'}
              color="orange"
            />
            <InfoCard
              label="Fuera de servicio"
              value={infoSuccion.FuS || '-'}
              color="red"
            />
          </div>

          {/* Tabla responsiva */}
          <div className="flex-1 overflow-x-auto rounded-lg shadow-md">
            <TableCustom
              columns={columnsTable}
              data={listpumps.length ? listpumps : []}
              pagination={true}
              pageSize={30}
              density="compact"
              header={{
                background: 'rgb(190 190 190)',
                fontSize: '14px',
                fontWeight: 'bold',
                paddingTop: 1,
              }}
              toolbarClass={{ background: 'rgb(190 190 190)' }}
              body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
              footer={{ background: 'rgb(190 190 190)' }}
            />
          </div>
        </CardCustom>
      )}
    </div>
  )
}

export default PumpsTable