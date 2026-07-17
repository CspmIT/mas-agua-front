import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { RiImageAddFill } from 'react-icons/ri';
import { MdPolyline } from 'react-icons/md';
import { LuBoxSelect, LuCircleDot, LuDatabase, LuExternalLink, LuPanelTop, LuPower, LuShapes } from 'react-icons/lu';
import { FaArrowRightLong } from 'react-icons/fa6';
import { HiOutlineVariable } from 'react-icons/hi';
import {
  iconButtonOnDarkPrimarySx,
  iconButtonOnDarkSx,
  sidebarShellSx,
} from '../../utils/js/diagramTheme';

const toolButtonSx = (isActive) => ({
  ...(isActive ? iconButtonOnDarkPrimarySx : iconButtonOnDarkSx),
  width: 38,
  height: 38,
  borderRadius: '9px',
  flexShrink: 0,
});

const Sidebar = ({
  tool,
  setTool,
  selectedId,
  setShowImageSelector,
  setShowLineStyleSelector,
  setShowTextStyler,
  setShowListField,
  setTextPosition,
  setTextInput,
  showSymbolSelector,
  setShowSymbolSelector,
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

  const togglePanel = () => {
    if (tool === 'panel') {
      setTool(null);
    } else {
      setTool('panel');
      setShowImageSelector(false);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
      setShowListField(false);
    }
  };

  const toggleWidget = (widgetTool) => {
    if (tool === widgetTool) {
      setTool(null);
    } else {
      setTool(widgetTool);
      setShowImageSelector(false);
      setShowLineStyleSelector(false);
      setShowTextStyler(false);
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

  return (
    <Box sx={sidebarShellSx} className='w-14 py-2 px-2 flex flex-col items-center gap-1 overflow-y-auto'>
      <Tooltip title='Agregar imagen' placement='right'>
        <IconButton onClick={toggleImage} sx={toolButtonSx(tool === 'imageSelector')}>
          <RiImageAddFill size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar línea' placement='right'>
        <IconButton onClick={toggleLine} sx={toolButtonSx(tool === 'simpleLine')}>
          <FaArrowRightLong size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar texto' placement='right'>
        <IconButton onClick={toggleText} sx={toolButtonSx(tool === 'text')}>
          <span className='text-base font-bold leading-none'>T</span>
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar polilínea' placement='right'>
        <IconButton onClick={togglePolyline} sx={toolButtonSx(tool === 'polyline')}>
          <MdPolyline size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar panel de información' placement='right'>
        <IconButton onClick={togglePanel} sx={toolButtonSx(tool === 'panel')}>
          <LuPanelTop size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar tanque de nivel' placement='right'>
        <IconButton onClick={() => toggleWidget('tank')} sx={toolButtonSx(tool === 'tank')}>
          <LuDatabase size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar LED de estado' placement='right'>
        <IconButton onClick={() => toggleWidget('led')} sx={toolButtonSx(tool === 'led')}>
          <LuCircleDot size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar botón de navegación' placement='right'>
        <IconButton onClick={() => toggleWidget('linkButton')} sx={toolButtonSx(tool === 'linkButton')}>
          <LuExternalLink size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Agregar botón de acción PLC' placement='right'>
        <IconButton onClick={() => toggleWidget('actionButton')} sx={toolButtonSx(tool === 'actionButton')}>
          <LuPower size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Insertar símbolo del catálogo' placement='right'>
        <IconButton
          onClick={() => {
            setShowSymbolSelector((prev) => !prev);
            setShowImageSelector(false);
            setShowLineStyleSelector(false);
            setShowTextStyler(false);
            setShowListField(false);
          }}
          sx={toolButtonSx(showSymbolSelector)}
        >
          <LuShapes size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Guardar elementos como símbolo (marcá un área)' placement='right'>
        <IconButton
          onClick={() => {
            if (tool === 'captureSymbol') {
              setTool(null);
            } else {
              setTool('captureSymbol');
              setShowSymbolSelector(false);
              setShowImageSelector(false);
              setShowLineStyleSelector(false);
              setShowTextStyler(false);
              setShowListField(false);
            }
          }}
          sx={toolButtonSx(tool === 'captureSymbol')}
        >
          <LuBoxSelect size={18} />
        </IconButton>
      </Tooltip>

      {!selectedId && (
        <Tooltip title='Asignar variable' placement='right'>
          <IconButton onClick={toggleFloatingVariable} sx={toolButtonSx(tool === 'floatingVariable')}>
            <HiOutlineVariable size={18} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default Sidebar;
