import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import VariableHistoryChart from './VariableHistoryChart';
import {
  floatingPanelSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';

//POPUP CON LA HISTORIA RECIENTE DE UNA VARIABLE (clic en un elemento de la vista)
const VariableHistoryPopup = ({ dataInflux, onClose }) => {
  const [lastValue, setLastValue] = useState(null);

  const unit = dataInflux.unit || '';

  return (
    <Box sx={floatingPanelSx} className='absolute bottom-3 right-3 z-20 w-[380px] max-w-[calc(100%-24px)] p-3 flex flex-col gap-2'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <h4 className={`${panelTitleClass} truncate`}>{dataInflux.name}</h4>
          <span className={panelLabelClass}>
            {lastValue !== null && !isNaN(lastValue)
              ? `Último valor: ${lastValue}${unit ? ` ${unit}` : ''}`
              : 'Historia de la variable'}
          </span>
        </div>
        <IconButton size='small' onClick={onClose}>
          <Close fontSize='small' />
        </IconButton>
      </div>

      <VariableHistoryChart
        dataInflux={dataInflux}
        onPointsLoaded={(points) => {
          const values = (points || []).map((p) => Number(p.value));
          setLastValue(values.length ? values[values.length - 1] : null);
        }}
      />
    </Box>
  );
};

export default VariableHistoryPopup;
