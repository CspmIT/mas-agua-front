import React from 'react';
import { Box } from '@mui/material';
import { floatingPanelSx, panelTitleClass } from '../../utils/js/diagramTheme';

const ImageSelector = ({ visible, images, onSelectImage }) => {
  if (!visible) return null;

  return (
    <Box
      sx={floatingPanelSx}
      className='absolute top-2 left-2 z-10 max-w-md p-3'
    >
      <h4 className={`${panelTitleClass} mb-2`}>Agregar imagen</h4>
      <div className='grid grid-cols-3 gap-2 max-h-96 overflow-y-auto'>
        {images.map((img) => (
          <button
            key={img.name}
            type='button'
            onClick={() => onSelectImage(img.src)}
            className='cursor-pointer p-1 max-h-36 rounded-md border border-transparent hover:border-[#2c6aa0]/40 hover:shadow-md dark:hover:border-[#5ea5f0]/40 transition'
          >
            <img
              src={img.src}
              alt={img.name}
              className='object-contain w-full h-full'
            />
          </button>
        ))}
      </div>
    </Box>
  );
};

export default ImageSelector;
