import React from 'react';
import { Box, Divider } from '@mui/material';
import { HiOutlineVariable } from 'react-icons/hi';
import { formatVariableValue } from '../../utils/js/formatVariableValue';
import { floatingPanelSx, panelLabelClass, panelTitleClass } from '../../utils/js/diagramTheme';

// Colores de los estados de las binarias calculadas (mismos del LED / modulo bombeo)
const RESULT_COLORS = {
  default: '#9ca3af',
  success: '#10b981',
  error: '#e11d48',
  warning: '#d8621d',
};

//TIPO LEGIBLE DE LA VARIABLE (la calculada binaria tiene prioridad: puede venir
//marcada tambien como binaria comprimida)
const getVariableKind = (d) => {
  if (d.calc_binary_compressed) return 'Binaria calculada';
  if (d.binary_compressed) return 'Binaria comprimida';
  if (d.calc) return 'Calculada';
  if (['booleano', 'binario', 'bool'].includes(d.unit?.toLowerCase?.() || '')) return 'Booleana';
  return 'Numérica';
};

const InfoRow = ({ label, children }) => (
  <div className='flex items-start justify-between gap-2'>
    <span className={`${panelLabelClass} flex-shrink-0`}>{label}</span>
    <span className='text-xs font-semibold text-slate-800 dark:text-gray-100 text-right break-all'>
      {children}
    </span>
  </div>
);

//INFO DE LA VARIABLE ASIGNADA AL ELEMENTO SELECCIONADO (debajo de la barra de acciones)
const SelectedVariableInfo = ({ element }) => {
  if (!element) return null;

  // Paneles: resumen de las variables por fila
  if (element.type === 'panel') {
    const rowsWithVar = (element.rows || []).filter((r) => r.dataInflux?.name);
    if (!rowsWithVar.length) return null;
    return (
      <Box sx={floatingPanelSx} className='absolute top-16 right-2 z-10 w-72 p-3 flex flex-col gap-2'>
        <h4 className={panelTitleClass}>
          <HiOutlineVariable className='inline mr-1.5 mb-0.5' size={15} />
          Variables del panel
        </h4>
        <Divider />
        {rowsWithVar.map((row) => (
          <InfoRow key={row.id} label={`${row.label}:`}>{row.dataInflux.name}</InfoRow>
        ))}
      </Box>
    );
  }

  const d = element.dataInflux;
  if (!d?.name) return null;

  const kind = getVariableKind(d);
  const isCalcBinary = Boolean(d.calc_binary_compressed);
  const firstVar = d.varsInflux?.[Object.keys(d.varsInflux || {})[0]] || {};
  const bits = Array.isArray(d.value) ? d.value : null; // binaria comprimida: bits en vivo
  const results = d.bitCalcVar?.results || null; // binaria calculada: variantes posibles
  const hiddenUnits = ['booleano', 'binario', 'bool', 'calc_binary'];

  return (
    <Box sx={floatingPanelSx} className='absolute top-16 right-2 z-10 w-72 p-3 flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <h4 className={`${panelTitleClass} truncate m-0`}>
          <HiOutlineVariable className='inline mr-1.5 mb-0.5' size={15} />
          {d.name}
        </h4>
        <span className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#2c6aa0]/10 text-[#2c6aa0] dark:bg-[#5ea5f0]/15 dark:text-[#5ea5f0] flex-shrink-0'>
          {kind}
        </span>
      </div>

      <Divider />

      <InfoRow label='Valor actual:'>{formatVariableValue(d)}</InfoRow>
      {!isCalcBinary && d.unit && !hiddenUnits.includes(d.unit.toLowerCase?.() || '') && (
        <InfoRow label='Unidad:'>{d.unit}</InfoRow>
      )}
      {!isCalcBinary && d.max_value_var ? (
        <InfoRow label='Valor máximo:'>{`${d.max_value_var} (muestra %)`}</InfoRow>
      ) : null}

      {/* Binaria comprimida: bit asignado y bits disponibles */}
      {d.binary_compressed && !isCalcBinary && (
        <>
          <InfoRow label='Bit asignado:'>{d.bit_name || 'Sin asignar'}</InfoRow>
          {bits && bits.length > 0 && (
            <div className='flex flex-col gap-1'>
              <span className={panelLabelClass}>Bits disponibles:</span>
              {bits.map((b) => (
                <div
                  key={b.id_bit}
                  className={`flex items-center justify-between text-xs px-2 py-0.5 rounded ${
                    b.id_bit === d.id_bit
                      ? 'bg-[#2c6aa0]/10 dark:bg-[#5ea5f0]/15 font-semibold text-slate-800 dark:text-gray-100'
                      : 'text-slate-500 dark:text-gray-400'
                  }`}
                >
                  <span className='truncate'>{b.bit}</span>
                  {b.id_bit === d.id_bit && <span className='text-[10px] text-[#2c6aa0] dark:text-[#5ea5f0]'>asignado</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Binaria calculada: variantes posibles con su color */}
      {d.calc_binary_compressed && results && (
        <div className='flex flex-col gap-1'>
          <span className={panelLabelClass}>Variantes posibles:</span>
          {Object.entries(results).map(([key, r]) => (
            <div key={key} className='flex items-center gap-2 text-xs text-slate-700 dark:text-gray-300 px-2'>
              <span
                className='inline-block w-2.5 h-2.5 rounded-full flex-shrink-0'
                style={{ backgroundColor: RESULT_COLORS[r.image] || RESULT_COLORS.default }}
              />
              <span className='truncate'>{r.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Origen del dato en Influx (las calculadas binarias tienen varias fuentes) */}
      {!isCalcBinary && (firstVar.calc_topic || firstVar.calc_field) && (
        <>
          <Divider />
          <p className='text-[10px] leading-snug text-slate-400 dark:text-gray-500 m-0 break-all'>
            {firstVar.calc_topic}{firstVar.calc_field ? ` · ${firstVar.calc_field}` : ''}
          </p>
        </>
      )}
    </Box>
  );
};

export default SelectedVariableInfo;
