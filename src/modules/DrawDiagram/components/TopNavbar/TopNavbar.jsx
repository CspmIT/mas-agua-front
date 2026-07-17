import React from 'react';
import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import { PiBroomBold } from 'react-icons/pi';
import { FaSave } from 'react-icons/fa';
import { IoArrowRedo, IoArrowUndo, IoCaretBackOutline } from 'react-icons/io5';
import { LuDownload } from 'react-icons/lu';
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

// Mismo tamaño que los botones del sidebar de herramientas
const navBtnSx = (base) => ({ ...base, width: 38, height: 38, borderRadius: '9px' });

const TopNavbar = ({
  onClear,
  onSaveDiagram,
  onUndo,
  onRedo,
  onExportPng,
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
            <IconButton onClick={onSaveDiagram} sx={navBtnSx(iconButtonSaveSx)}>
              <FaSave size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Limpiar lienzo'>
            <IconButton onClick={onClear} sx={navBtnSx(iconButtonDangerSx)}>
              <PiBroomBold size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Deshacer (Ctrl+Z)'>
            <IconButton onClick={onUndo} sx={navBtnSx(iconButtonOnDarkSx)}>
              <IoArrowUndo size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Rehacer (Ctrl+Y)'>
            <IconButton onClick={onRedo} sx={navBtnSx(iconButtonOnDarkSx)}>
              <IoArrowRedo size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Exportar como imagen PNG'>
            <IconButton onClick={onExportPng} sx={navBtnSx(iconButtonOnDarkSx)}>
              <LuDownload size={18} />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={toolbarDividerOnDarkSx} />

          <Tooltip title='Acercar'>
            <IconButton onClick={onZoomIn} sx={navBtnSx(iconButtonOnDarkSx)}>
              <LuZoomIn size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Alejar'>
            <IconButton onClick={onZoomOut} sx={navBtnSx(iconButtonOnDarkSx)}>
              <LuZoomOut size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isPanning ? 'Modo mover activo' : 'Mover diagrama'}>
            <IconButton
              onClick={() => setIsPanning((prev) => !prev)}
              sx={navBtnSx(isPanning ? iconButtonOnDarkToggledSx : iconButtonOnDarkSx)}
            >
              <IoMdMove size={18} />
            </IconButton>
          </Tooltip>

          {selectedId && (
            <>
              <Divider orientation='vertical' flexItem sx={toolbarDividerOnDarkSx} />
              <Tooltip title='Enviar al fondo'>
                <IconButton onClick={onSendToBack} sx={navBtnSx(iconButtonOnDarkSx)}>
                  <MdOutlineMoveDown size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Traer al frente'>
                <IconButton onClick={onBringToFront} sx={navBtnSx(iconButtonOnDarkSx)}>
                  <MdOutlineMoveUp size={18} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>

        <div className='flex items-center gap-1.5'>
          <Tooltip title='Volver al listado'>
            <IconButton onClick={listDiagram} sx={navBtnSx(iconButtonOnDarkSx)}>
              <IoCaretBackOutline size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Box>
  );
};

export default TopNavbar;
