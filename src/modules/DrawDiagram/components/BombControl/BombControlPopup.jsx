import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import { storage } from '../../../../storage/storage';
import { ActionPill, StatusChip } from '../../../PumpsTable/components/PumpPrimitives';
import {
  floatingPanelSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';

// Perfiles internos habilitados para enviar comandos: Moderador, Operador, Super Admin
const OPERATOR_PROFILES = [1, 2, 4];

// Ventana de gracia tras un comando: Influx se alimenta por MQTT con ~1 min de retraso
const PENDING_MS = 90000;

// Mismo mapeo de modo que la tabla del modulo de bombeo
const MODE_TONES = {
  'Automático': 'warning',
  'Encendido forzado': 'success',
  'Apagado forzado': 'error',
};

//POPUP DE CONTROL DE UNA BOMBA PLC DESDE LA VISTA DEL DIAGRAMA
const BombControlPopup = ({ idBomb, onClose }) => {
  const [bomb, setBomb] = useState(null); // null = cargando
  const [sending, setSending] = useState(null);
  const pendingUntilRef = useRef(0);
  const bombNameRef = useRef(null);

  const usuario = storage.get('usuario');
  const canOperate = OPERATOR_PROFILES.includes(Number(usuario?.profile));

  useEffect(() => {
    let cancelled = false;

    const fetchBomb = async () => {
      setBomb(null);
      try {
        const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/bombs_PLC`, 'GET');
        if (cancelled) return;
        const found = (response?.data?.bombs || []).find((b) => String(b.id) === String(idBomb));
        bombNameRef.current = found?.name || null;
        setBomb(found || false); // false = no encontrada
      } catch (error) {
        console.error('Error obteniendo la bomba:', error);
        if (!cancelled) setBomb(false);
      }
    };
    fetchBomb();

    // Refresco del estado cada 30s, respetando la ventana de gracia post-comando
    const interval = setInterval(async () => {
      if (Date.now() < pendingUntilRef.current || !bombNameRef.current) return;
      try {
        const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/data_bombeo`, 'GET');
        if (cancelled) return;
        const data = response?.data || {};
        setBomb((prev) => {
          if (!prev) return prev;
          const status = data.bombas?.[prev.name];
          const mode = data.modos?.[prev.name];
          return {
            ...prev,
            status: status !== undefined ? status : prev.status,
            actual_mode: mode || prev.actual_mode,
          };
        });
      } catch (error) {
        console.error('Error actualizando el estado de la bomba:', error);
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [idBomb]);

  const sendAction = async (actionName) => {
    const action = bomb?.actions?.find(
      (a) => a.name?.toUpperCase() === actionName.toUpperCase()
    );
    if (!action) {
      Swal.fire({ icon: 'error', title: 'Error', text: `La bomba no tiene configurada la acción ${actionName}.` });
      return;
    }

    const result = await Swal.fire({
      title: `¿Enviar "${action.name}"?`,
      text: `Se enviará el comando a ${bomb.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;

    setSending(actionName);
    try {
      const response = await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/bombs_PLC/execute`,
        'POST',
        { bombId: bomb.id, actionId: action.id }
      );

      const live = response?.data?.liveStatus;
      pendingUntilRef.current = Date.now() + PENDING_MS;
      setBomb((prev) => ({
        ...prev,
        actual_mode: live?.actual_mode ?? prev.actual_mode,
        status: live?.status !== undefined ? live.status : prev.status,
      }));

      Swal.fire({
        icon: 'success',
        title: 'Comando enviado',
        text: `"${action.name}" enviado a ${bomb.name}.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error enviando el comando:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar el comando a la bomba.' });
    } finally {
      setSending(null);
    }
  };

  const isWithoutData = bomb?.actual_mode === 'Sin datos' || !bomb?.actual_mode;
  const isAuto = bomb?.actual_mode === 'Automático';

  return (
    <Box sx={floatingPanelSx} className='absolute bottom-3 right-3 z-20 w-80 max-w-[calc(100%-24px)] p-3 flex flex-col gap-2.5'>
      {/* Titulo con el estado al lado, como pide la vista */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <h4 className={`${panelTitleClass} truncate m-0`}>{bomb?.name || 'Bomba'}</h4>
          {bomb && bomb !== false && (
            bomb.status === true ? (
              <StatusChip label='En Marcha' tone='success' pulse />
            ) : bomb.status === false ? (
              <StatusChip label='Apagada' tone='neutral' />
            ) : (
              <StatusChip label='Sin datos' tone='warning' />
            )
          )}
        </div>
        <IconButton size='small' onClick={onClose}>
          <Close fontSize='small' />
        </IconButton>
      </div>

      {bomb === null ? (
        <div className='flex justify-center py-5'>
          <CircularProgress size={26} />
        </div>
      ) : bomb === false ? (
        <p className={panelLabelClass}>No se encontró la bomba asignada a este elemento.</p>
      ) : (
        <>
          <div className='flex items-center gap-2'>
            <StatusChip
              label={bomb.actual_mode || 'Sin datos'}
              tone={MODE_TONES[bomb.actual_mode] || 'neutral'}
            />
          </div>

          {canOperate ? (
            <>
              <div className='flex gap-1.5'>
                <ActionPill
                  label='AUTO'
                  variant='amber'
                  disabled={isWithoutData || isAuto || Boolean(sending)}
                  onClick={() => sendAction('AUTO')}
                />
                <ActionPill
                  label='ON'
                  variant='green'
                  disabled={isWithoutData || !isAuto || Boolean(sending)}
                  onClick={() => sendAction('ON')}
                />
                <ActionPill
                  label='OFF'
                  variant='red'
                  disabled={isWithoutData || !isAuto || Boolean(sending)}
                  onClick={() => sendAction('OFF')}
                />
              </div>
              <p className={`${panelLabelClass} m-0`}>
                ON/OFF disponibles en modo Automático. El estado puede demorar ~1 min en reflejarse.
              </p>
            </>
          ) : (
            <p className={`${panelLabelClass} m-0`}>
              Tu perfil solo permite ver el estado (los comandos son para perfiles operativos).
            </p>
          )}
        </>
      )}
    </Box>
  );
};

export default BombControlPopup;
