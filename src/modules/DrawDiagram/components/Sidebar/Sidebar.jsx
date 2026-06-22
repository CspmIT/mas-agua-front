import React from 'react';
import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import { RiImageAddFill } from 'react-icons/ri';
import { MdDelete, MdPolyline } from 'react-icons/md';
import { FaArrowRightLong } from 'react-icons/fa6';
import { HiOutlineVariable } from 'react-icons/hi';
import {
  iconButtonDangerSx,
  iconButtonOnDarkPrimarySx,
  iconButtonOnDarkSx,
  sidebarShellSx,
} from '../../utils/js/diagramTheme';

const toolButtonSx = (isActive) => ({
  ...(isActive ? iconButtonOnDarkPrimarySx : iconButtonOnDarkSx),
  width: 44,
  height: 44,
});

const Sidebar = ({
  tool,
  setTool,
  selectedId,
  setShowImageSelector,
  setShowLineStyleSelector,
  setShowTextStyler,
  setShowListField,
  setElements,
  setCircles,
  setSelectedId,
  setTextPosition,
  setTextInput,
  handleDeleteElement,
}) => {
  const toggleImage = () => {
    if (tool === 'imageSelector') {
      setTool(null);
      setShowImageSelector(false);
    } else {
      setTool('imageSelector');
      setShowImageSelector(true);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
      setShowListField(false);
    }
  };

  const toggleLine = () => {
    if (tool === 'simpleLine') {
      setTool(null);
      setShowLineStyleSelector(false);
    } else {
      setTool('simpleLine');
      setShowLineStyleSelector(true);
      setShowTextStyler(false);
      setShowImageSelector(false);
      setShowListField(false);
    }
  };

  const toggleText = () => {
    if (tool === 'text') {
      setTool(null);
      setShowTextStyler(false);
      setTextPosition(null);
      setTextInput('');
    } else {
      setTool('text');
      setShowLineStyleSelector(false);
      setShowTextStyler(true);
      setShowImageSelector(false);
      setShowListField(false);
    }
  };

  const togglePolyline = () => {
    if (tool === 'polyline') {
      setTool(null);
      setShowLineStyleSelector(false);
    } else {
      setTool('polyline');
      setShowLineStyleSelector(true);
      setShowTextStyler(false);
      setShowImageSelector(false);
      setShowListField(false);
    }
  };

  const toggleFloatingVariable = () => {
    if (tool === 'floatingVariable') {
      setTool(null);
      setShowListField(false);
    } else {
      setTool('floatingVariable');
      setShowListField(true);
      setShowImageSelector(false);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
    }
  };

  const toggleFields = () => {
    if (tool === 'fields') {
      setTool(null);
      setShowListField(false);
    } else {
      setTool('fields');
      setShowListField(true);
      setShowImageSelector(false);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
    }
  };

  const handleDelete = () => {
    setElements((prev) => prev.filter((el) => String(el.id) !== String(selectedId)));
    setCircles((prev) => prev.filter((c) => String(c.lineId) !== String(selectedId)));
    handleDeleteElement(selectedId);
    setTool(null);
    setSelectedId(null);
    setShowImageSelector(false);
    setShowLineStyleSelector(false);
    setShowTextStyler(false);
    setTextPosition(null);
  };

  return (
    <Box sx={sidebarShellSx} className='w-16 py-3 px-2 flex flex-col items-center gap-1.5'>
      <Tooltip title='Agregar imagen' placement='right'>
        <IconButton onClick={toggleImage} sx={toolButtonSx(tool === 'imageSelector')}>
          <RiImageAddFill size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar línea' placement='right'>
        <IconButton onClick={toggleLine} sx={toolButtonSx(tool === 'simpleLine')}>
          <FaArrowRightLong size={20} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar texto' placement='right'>
        <IconButton onClick={toggleText} sx={toolButtonSx(tool === 'text')}>
          <span className='text-lg font-bold leading-none'>T</span>
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar polilínea' placement='right'>
        <IconButton onClick={togglePolyline} sx={toolButtonSx(tool === 'polyline')}>
          <MdPolyline size={20} />
        </IconButton>
      </Tooltip>

      {!selectedId && (
        <Tooltip title='Asignar variable' placement='right'>
          <IconButton onClick={toggleFloatingVariable} sx={toolButtonSx(tool === 'floatingVariable')}>
            <HiOutlineVariable size={20} />
          </IconButton>
        </Tooltip>
      )}

      {selectedId && (
        <>
          <Divider
            flexItem
            sx={{
              my: 1,
              border: 'none',
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
          <Tooltip title='Asignar variable' placement='right'>
            <IconButton onClick={toggleFields} sx={toolButtonSx(tool === 'fields')}>
              <HiOutlineVariable size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Borrar elemento' placement='right'>
            <IconButton onClick={handleDelete} sx={{ ...iconButtonDangerSx, width: 44, height: 44 }}>
              <MdDelete size={20} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default Sidebar;
