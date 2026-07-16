import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { LuPower } from 'react-icons/lu';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';

//ASIGNA UNA BOMBA PLC A LA IMAGEN SELECCIONADA (habilita el control en la vista)
const BombSelector = ({ image, onChange }) => {
  const [bombs, setBombs] = useState(null); // null = cargando
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchBombs = async () => {
      try {
        const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/bombs_PLC`, 'GET');
        const list = (response?.data?.bombs || []).filter(
          (b) => !b.control_type || b.control_type === 'bomb'
        );
        setBombs(list);
      } catch (error) {
        console.error('Error obteniendo las bombas:', error);
        setBombs([]);
      }
    };
    fetchBombs();
  }, []);

  if (!image || image.type !== 'image') return null;

  const currentBomb = (bombs || []).find((b) => String(b.id) === String(image.idBomb));
  const filtered = (bombs || []).filter((b) =>
    b.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={floatingPanelSx} className='absolute left-2 top-2 z-20 w-72 p-3 flex flex-col gap-3'>
      <h4 className={panelTitleClass}>Asignar bomba</h4>

      <p className={panelLabelClass}>
        En la vista, el clic sobre esta imagen abre el estado y los comandos de la bomba.
      </p>

      {image.idBomb ? (
        <div className='flex items-center justify-between gap-2 rounded-lg bg-[#2c6aa0]/10 dark:bg-[#5ea5f0]/15 px-2.5 py-1.5'>
          <span className='text-sm text-slate-800 dark:text-gray-100 truncate'>
            <LuPower className='inline mr-1.5' size={14} />
            {image.bombName || currentBomb?.name || `Bomba #${image.idBomb}`}
          </span>
          <Button
            size='small'
            variant='outlined'
            sx={{ ...ghostPillSx, flexShrink: 0 }}
            onClick={() => onChange({ ...image, idBomb: null, bombName: null })}
          >
            Quitar
          </Button>
        </div>
      ) : null}

      <Divider />

      <TextField
        size='small'
        fullWidth
        label='Buscar bomba'
        onChange={(e) => setFilter(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search fontSize='small' />
            </InputAdornment>
          ),
        }}
      />

      {bombs === null ? (
        <div className='flex justify-center py-4'>
          <CircularProgress size={24} />
        </div>
      ) : (
        <List dense className='overflow-y-auto max-h-[300px] !py-0'>
          {filtered.map((bomb) => (
            <ListItem
              key={bomb.id}
              button
              selected={String(bomb.id) === String(image.idBomb)}
              onClick={() => onChange({ ...image, idBomb: bomb.id, bombName: bomb.name })}
              className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
            >
              <ListItemText
                primary={bomb.name}
                primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
              />
            </ListItem>
          ))}
          {!filtered.length && (
            <p className={`${panelLabelClass} px-2 py-1`}>No hay bombas configuradas.</p>
          )}
        </List>
      )}
    </Box>
  );
};

export default BombSelector;
