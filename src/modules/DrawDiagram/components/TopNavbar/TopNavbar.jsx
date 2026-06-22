import React from 'react';
import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import { PiBroomBold } from 'react-icons/pi';
import { FaSave } from 'react-icons/fa';
import { IoArrowUndo, IoCaretBackOutline } from 'react-icons/io5';
import { MdOutlineMoveDown, MdOutlineMoveUp } from 'react-icons/md';
import { IoMdMove } from 'react-icons/io';
import { LuZoomIn, LuZoomOut } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  iconButtonDangerSx,
  iconButtonOnDarkSx,
  iconButtonOnDarkToggledSx,
  iconButtonSaveSx,
  navbarShellSx,
  toolbarDividerOnDarkSx,
} from '../../utils/js/diagramTheme';

const TopNavbar = ({
  onClear,
  onSaveDiagram,
  onUndo,
  elements = [],
  selectedId,
  onSendToBack,
  onBringToFront,
  onZoomIn,
  onZoomOut,
  isPanning,
  setIsPanning,
}) => {
  const navigate = useNavigate();

  const listDiagram = async () => {
    if (elements.length > 0) {
      const result = await Swal.fire({
        title: '¿Deseás salir?',
        text: 'Hay elementos en el lienzo. Si salís podrías perder cambios.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      });

      if (!result.isConfirmed) return;
    }

    navigate('/config/diagram');
  };

  return (
    <Box sx={navbarShellSx} className='w-full'>
      <div className='flex items-center justify-between px-3 py-2 gap-2 flex-wrap'>
        <div className='flex items-center gap-1.5 flex-wrap'>
          <Tooltip title='Guardar diagrama'>
            <IconButton onClick={onSaveDiagram} sx={iconButtonSaveSx}>
              <FaSave size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Limpiar lienzo'>
            <IconButton onClick={onClear} sx={iconButtonDangerSx}>
              <PiBroomBold size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Deshacer'>
            <IconButton onClick={onUndo} sx={iconButtonOnDarkSx}>
              <IoArrowUndo size={18} />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={toolbarDividerOnDarkSx} />

          <Tooltip title='Acercar'>
            <IconButton onClick={onZoomIn} sx={iconButtonOnDarkSx}>
              <LuZoomIn size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Alejar'>
            <IconButton onClick={onZoomOut} sx={iconButtonOnDarkSx}>
              <LuZoomOut size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isPanning ? 'Modo mover activo' : 'Mover diagrama'}>
            <IconButton
              onClick={() => setIsPanning((prev) => !prev)}
              sx={isPanning ? iconButtonOnDarkToggledSx : iconButtonOnDarkSx}
            >
              <IoMdMove size={18} />
            </IconButton>
          </Tooltip>

          {selectedId && (
            <>
              <Divider orientation='vertical' flexItem sx={toolbarDividerOnDarkSx} />
              <Tooltip title='Enviar al fondo'>
                <IconButton onClick={onSendToBack} sx={iconButtonOnDarkSx}>
                  <MdOutlineMoveDown size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Traer al frente'>
                <IconButton onClick={onBringToFront} sx={iconButtonOnDarkSx}>
                  <MdOutlineMoveUp size={18} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>

        <div className='flex items-center gap-1.5'>
          <Tooltip title='Volver al listado'>
            <IconButton onClick={listDiagram} sx={iconButtonOnDarkSx}>
              <IoCaretBackOutline size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Box>
  );
};

export default TopNavbar;
