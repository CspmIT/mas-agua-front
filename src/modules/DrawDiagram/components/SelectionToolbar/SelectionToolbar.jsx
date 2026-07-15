import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { MdContentCopy, MdDelete } from 'react-icons/md';
import { HiOutlineVariable } from 'react-icons/hi';
import {
  floatingPanelSx,
  iconButtonDangerSx,
  iconButtonGhostSx,
  iconButtonPrimarySx,
} from '../../utils/js/diagramTheme';

//ACCIONES DEL ELEMENTO SELECCIONADO: flotante arriba a la derecha del canvas
const SelectionToolbar = ({ isAssigningVariable, onAssignVariable, onDuplicate, onDelete }) => (
  <Box sx={floatingPanelSx} className='absolute top-2 right-2 z-10 p-1.5 flex items-center gap-1.5'>
    <Tooltip title='Asignar variable' placement='bottom'>
      <IconButton
        onClick={onAssignVariable}
        sx={{ ...(isAssigningVariable ? iconButtonPrimarySx : iconButtonGhostSx), width: 40, height: 40 }}
      >
        <HiOutlineVariable size={20} />
      </IconButton>
    </Tooltip>
    <Tooltip title='Duplicar elemento (Ctrl+C / Ctrl+V)' placement='bottom'>
      <IconButton onClick={onDuplicate} sx={{ ...iconButtonGhostSx, width: 40, height: 40 }}>
        <MdContentCopy size={18} />
      </IconButton>
    </Tooltip>
    <Tooltip title='Borrar elemento (Supr)' placement='bottom'>
      <IconButton onClick={onDelete} sx={{ ...iconButtonDangerSx, width: 40, height: 40 }}>
        <MdDelete size={20} />
      </IconButton>
    </Tooltip>
  </Box>
);

export default SelectionToolbar;
