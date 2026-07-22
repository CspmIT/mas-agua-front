import { useEffect, useState } from 'react';
import { Button, CircularProgress, IconButton } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import ModalShell from '../../../../components/ModalShell';
import { getPumpStatus, sendSetPoint, refreshPumpStatus } from '../../../PumpGenibus/services/api';

// Limites del setpoint (mismos que la vista de Salida urbana)
const SET_POINT_MIN = 0.1;
const SET_POINT_MAX = 2.0;

const round1 = (value) => Math.round(value * 10) / 10;

const stepBtnSx = {
  border: '1px solid rgba(148, 163, 184, 0.4)',
  width: 34,
  height: 34,
};

// Popup del boton "setpoint bombeo urbano" del diagrama: misma logica que el
// control de la card de Salida urbana (ajustar de a 0.1 bar y confirmar).
const PumpSetPointPopup = ({ onClose, onSent }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getPumpStatus()
      .then(({ data }) => {
        setStatus(data);
        setDraft(Number(data.set_point));
      })
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const stepDraft = (delta) => {
    setDraft((prev) => {
      const next = round1(prev + delta);
      if (next < SET_POINT_MIN || next > SET_POINT_MAX) return prev;
      return next;
    });
  };

  const confirmSetPoint = async () => {
    const result = await Swal.fire({
      title: '¿Confirmás esta acción?',
      html: `La presión de salida del agua pasará a <b>${draft.toFixed(1)} bar</b>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#42C88A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      setSending(true);
      await sendSetPoint(draft);
      onSent?.();
      onClose();
      Swal.fire({
        title: 'Correcto',
        html: 'Comando ejecutado correctamente.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });
      // Ciclo de lectura para que el proximo poll muestre el SP confirmado
      refreshPumpStatus().catch(() => {});
    } catch (error) {
      setSending(false);
      Swal.fire({
        title: 'Error',
        html: error?.response?.data?.message || String(error),
        icon: 'error',
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  };

  return (
    <ModalShell
      open
      onClose={onClose}
      maxWidth={380}
      title='Setpoint bombeo urbano'
      eyebrow='Salida urbana'
    >
      <div className='p-5 flex flex-col items-center gap-4'>
        {loading ? (
          <CircularProgress size={28} />
        ) : !status ? (
          <p className='text-sm text-gray-400 text-center'>
            No hay lecturas del equipo de bombeo todavía.
          </p>
        ) : (
          <>
            <div className='flex gap-8 text-center'>
              <div>
                <div className='text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold'>
                  Presión actual
                </div>
                <div className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                  {Number(status.presion_actual).toFixed(3)}
                  <span className='text-sm font-normal text-gray-400 ml-1'>bar</span>
                </div>
              </div>
              <div>
                <div className='text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold'>
                  Setpoint actual
                </div>
                <div className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                  {Number(status.set_point).toFixed(1)}
                  <span className='text-sm font-normal text-gray-400 ml-1'>bar</span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <IconButton size='small' sx={stepBtnSx} onClick={() => stepDraft(-0.1)} disabled={sending}>
                <RemoveIcon fontSize='small' />
              </IconButton>
              <span className='text-3xl font-bold text-secondary w-20 text-center'>
                {draft?.toFixed(1)}
              </span>
              <IconButton size='small' sx={stepBtnSx} onClick={() => stepDraft(0.1)} disabled={sending}>
                <AddIcon fontSize='small' />
              </IconButton>
            </div>

            <Button
              variant='contained'
              color='success'
              disabled={sending || draft === Number(status.set_point)}
              onClick={confirmSetPoint}
              sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600, px: 4 }}
            >
              {sending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enviar al equipo'}
            </Button>
          </>
        )}
      </div>
    </ModalShell>
  );
};

export default PumpSetPointPopup;
