import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { LuPower } from 'react-icons/lu';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';

// Reglas de visibilidad del boton en la vista (mismas del sistema PHP anterior)
const SHOW_WHEN_OPTIONS = [
  { value: 'always', label: 'Siempre' },
  { value: 'comm_down', label: 'Solo sin comunicación (succión sin datos)' },
  { value: 'not_enabled', label: 'Solo cuando la ósmosis no está habilitada' },
];

//EDITOR DEL BOTON DE ACCION PLC: equipo, etiqueta y regla de visibilidad
const ActionButtonPanel = ({ button, onChange }) => {
  const [controls, setControls] = useState(null); // null = cargando

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/bombs_PLC`, 'GET');
        const list = (response?.data?.bombs || []).filter(
          (b) => b.control_type && b.control_type !== 'bomb' && b.id != null
        );
        setControls(list);
      } catch (error) {
        console.error('Error obteniendo los equipos PLC:', error);
        setControls([]);
      }
    };
    fetchControls();
  }, []);

  if (!button || button.type !== 'actionButton') return null;

  const currentControl = (controls || []).find((c) => String(c.id) === String(button.idBomb));

  return (
    <Box sx={floatingPanelSx} className='absolute left-2 top-2 z-10 w-72 p-3 flex flex-col gap-3'>
      <h4 className={panelTitleClass}>Botón de acción PLC</h4>

      <TextField
        size='small'
        label='Etiqueta'
        value={button.config?.label || ''}
        onChange={(e) => onChange({ ...button, config: { ...button.config, label: e.target.value } })}
        fullWidth
      />

      <div>
        <label className={`${panelLabelClass} block mb-1`}>Mostrar en la vista</label>
        <FormControl fullWidth size='small'>
          <Select
            value={button.config?.showWhen || 'always'}
            onChange={(e) => onChange({ ...button, config: { ...button.config, showWhen: e.target.value } })}
          >
            {SHOW_WHEN_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {button.idBomb || button.config?.timedReboot || button.config?.pumpSetPoint ? (
        <div className='flex items-center justify-between gap-2 rounded-lg bg-[#2c6aa0]/10 dark:bg-[#5ea5f0]/15 px-2.5 py-1.5'>
          <span className='text-sm text-slate-800 dark:text-gray-100 truncate'>
            <LuPower className='inline mr-1.5' size={14} />
            {button.bombName || currentControl?.name || `Equipo #${button.idBomb}`}
          </span>
          <Button
            size='small'
            variant='outlined'
            sx={{ ...ghostPillSx, flexShrink: 0 }}
            onClick={() =>
              onChange({
                ...button,
                idBomb: null,
                bombName: null,
                config: { ...button.config, timedReboot: false, pumpSetPoint: false },
              })
            }
          >
            Quitar
          </Button>
        </div>
      ) : (
        <p className={panelLabelClass}>Elegí el equipo al que envía la acción:</p>
      )}

      <Divider />

      {controls === null ? (
        <div className='flex justify-center py-4'>
          <CircularProgress size={24} />
        </div>
      ) : (
        <List dense className='overflow-y-auto max-h-[260px] !py-0'>
          {/* Destino especial: setpoint del bombeo urbano (Genibus) */}
          <ListItem
            button
            selected={Boolean(button.config?.pumpSetPoint)}
            onClick={() =>
              onChange({
                ...button,
                idBomb: null,
                bombName: 'Setpoint bombeo urbano',
                config: { ...button.config, pumpSetPoint: true, timedReboot: false },
              })
            }
            className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
          >
            <ListItemText
              primary='Setpoint bombeo urbano (Genibus)'
              secondary='Abre el ajuste de presión de salida'
              primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
              secondaryTypographyProps={{ className: 'dark:!text-gray-400' }}
            />
          </ListItem>
          {/* Destino especial: toggle de la automatizacion de reinicio (OI-50) */}
          <ListItem
            button
            selected={Boolean(button.config?.timedReboot)}
            onClick={() =>
              onChange({
                ...button,
                idBomb: null,
                bombName: 'Automatización de reinicio',
                config: { ...button.config, timedReboot: true, pumpSetPoint: false },
              })
            }
            className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
          >
            <ListItemText
              primary='Automatización de reinicio (OI-50)'
              secondary='Iniciar / Detener según estado'
              primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
              secondaryTypographyProps={{ className: 'dark:!text-gray-400' }}
            />
          </ListItem>
          {controls.map((control) => (
            <ListItem
              key={control.id}
              button
              selected={String(control.id) === String(button.idBomb)}
              onClick={() =>
                onChange({
                  ...button,
                  idBomb: control.id,
                  bombName: control.name,
                  config: { ...button.config, timedReboot: false, pumpSetPoint: false },
                })
              }
              className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
            >
              <ListItemText
                primary={control.name}
                secondary={
                  control.control_type === 'osmosis_onoff'
                    ? 'ON / OFF según estado'
                    : (control.actions || []).filter((a) => a.comando !== 'leer').map((a) => a.name).join(', ') || 'Acción directa'
                }
                primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
                secondaryTypographyProps={{ className: 'dark:!text-gray-400' }}
              />
            </ListItem>
          ))}
          {!controls.length && (
            <p className={`${panelLabelClass} px-2 py-1`}>No hay equipos PLC configurados.</p>
          )}
        </List>
      )}
    </Box>
  );
};

export default ActionButtonPanel;
