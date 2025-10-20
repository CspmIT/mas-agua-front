import { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { request } from '../../../utils/js/request';
import { backend } from '../../../utils/routes/app.routes';
import TableCustom from '../../../components/TableCustom';
import Swal from 'sweetalert2';
import LoaderComponent from '../../../components/Loader';
import ModalAlarms from '../components/ModalAlarm';

const ConfigAlarms = () => {
  const [listAlarm, setListAlarm] = useState([]);
  const [columnsTable, setColumnsTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAlarms, setModalAlarms] = useState(false)
  const [selectedAlarm, setSelectedAlarm] = useState(null)

  const fetchAlarms = async () => {
    const url = backend[import.meta.env.VITE_APP_NAME];
    try {
      setLoading(true);
      const { data } = await request(`${url}/getAlarms`, 'GET');

      const columns = [
        { header: 'ID', accessorKey: 'id', size: 50 },
        { header: 'Nombre', accessorKey: 'name' },
      
        {
          header: 'Condición',
          accessorKey: 'condition',
          Cell: ({ row }) => {
            const alarm = row.original
            if (alarm.type === 'single') {
              return (
                <span className="text-sm">
                  {alarm.var_name} {alarm.condition}{' '}
                  {alarm.condition === 'entre'
                    ? `${alarm.value} y ${alarm.value2}`
                    : alarm.value}
                </span>
              )
            }
      
            return (
              <div className="text-sm flex flex-col gap-1">
                <span>
                  {alarm.var_name} {alarm.condition}{' '}
                  {alarm.condition === 'entre'
                    ? `${alarm.value} y ${alarm.value2}`
                    : alarm.value}
                </span>
                <span className="text-blue-700 font-bold text-xs">
                  {alarm.logicOperator}
                </span>
                <span>
                  {alarm.secondaryVarName} {alarm.secondaryCondition} {alarm.secondaryValue}
                </span>
              </div>
            )
          },
        },
      
        {
          header: 'Tipo',
          accessorKey: 'type',
          size: 100,
          Cell: ({ row }) => (
            <span
              className={`text-sm font-semibold ${
                row.original.type === 'combined' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {row.original.type === 'combined' ? 'Combinada' : 'Simple'}
            </span>
          ),
        },
      
        {
          header: 'Repetir cada',
          accessorKey: 'repeatInterval',
          size: 80,
          Cell: ({ row }) => (
            <span className="text-sm">{row.original.repeatInterval} min.</span>
          ),
        },
      
        {
          header: 'Estado',
          accessorKey: 'status',
          size: 50,
          Cell: ({ row }) => (
            <span
              className={`text-sm font-semibold ${
                row.original.status ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {row.original.status ? 'Activo' : 'Inactivo'}
            </span>
          ),
        },
      
        {
          header: 'Acciones',
          accessorKey: 'actions',
          Cell: ({ row }) => (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedAlarm(row.original)
                  setModalAlarms(true)
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
                  const confirm = await Swal.fire({
                    icon: 'question',
                    html: `¿Seguro que querés ${row.original.status ? 'desactivar' : 'activar'} esta alarma?`,
                    showCancelButton: true,
                    confirmButtonText: row.original.status ? 'Desactivar' : 'Activar',
                    cancelButtonText: 'Cancelar',
                  })
                  if (!confirm.isConfirmed) return
                  try {
                    const { data: res } = await request(
                      `${url}/changeStatusAlarm`,
                      'PUT',
                      {
                        id: row.original.id,
                        status: row.original.status,
                      }
                    )
                    if (res) {
                      await Swal.fire({
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500,
                        icon: 'success',
                        text: 'Alarma actualizada correctamente',
                        toast: true,
                      })
                      setListAlarm((prev) =>
                        prev.map((d) =>
                          d.id === row.original.id ? { ...d, status: !d.status } : d
                        )
                      )
                    }
                  } catch (err) {
                    console.error(err)
                    Swal.fire({
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 1500,
                      icon: 'error',
                      text: 'No se pudo actualizar el estado de la alarma',
                      toast: true,
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

      setColumnsTable(columns);
      setListAlarm(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron obtener las alarmas.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  return (
    <>
      <Container>
        <div className="flex flex-col gap-3">
          <Box display="flex" justifyContent={'space-between'} alignItems={'center'} mb={3}>
            <Typography variant="h3" align="center" flexGrow={1}>
              Alarmas
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setModalAlarms(true)}
            >
              Crear alarma
            </Button>
          </Box>
        </div>
        {!loading ? (
          <TableCustom
            columns={columnsTable}
            data={listAlarm.length ? listAlarm : []}
            pagination={true}
            pageSize={10}
          />
        ) : (
          <LoaderComponent />
        )}
        <ModalAlarms
          openModal={modalAlarms}
          setOpenModal={setModalAlarms}
          onSuccess={fetchAlarms}
          alarmData={selectedAlarm}
        />
      </Container>

    </>
  )
}

export default ConfigAlarms