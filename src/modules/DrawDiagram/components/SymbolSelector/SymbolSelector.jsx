import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import { Close, DeleteOutline, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import { floatingPanelSx, panelLabelClass, panelTitleClass } from '../../utils/js/diagramTheme';

//CATALOGO DE SIMBOLOS REUTILIZABLES: clic inserta el simbolo en el canvas
const SymbolSelector = ({ onInsert, onClose }) => {
  const [symbols, setSymbols] = useState(null); // null = cargando
  const [filter, setFilter] = useState('');

  const fetchSymbols = async () => {
    try {
      const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/getDiagramSymbols`, 'GET');
      setSymbols(response?.data || []);
    } catch (error) {
      console.error('Error obteniendo los símbolos:', error);
      setSymbols([]);
    }
  };

  useEffect(() => {
    fetchSymbols();
  }, []);

  const handleDelete = async (symbol) => {
    const result = await Swal.fire({
      title: '¿Eliminar símbolo?',
      text: `Se eliminará "${symbol.name}" del catálogo. Los diagramas ya armados no se modifican.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (!result.isConfirmed) return;

    try {
      await request(`${backend[import.meta.env.VITE_APP_NAME]}/deleteDiagramSymbol`, 'PUT', { id: symbol.id });
      fetchSymbols();
    } catch (error) {
      console.error('Error eliminando el símbolo:', error);
    }
  };

  const filtered = (symbols || []).filter((s) =>
    s.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={floatingPanelSx} className='absolute left-2 top-2 z-20 w-72 p-3 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <h4 className={panelTitleClass}>Símbolos</h4>
        <IconButton size='small' onClick={onClose}>
          <Close fontSize='small' />
        </IconButton>
      </div>

      <p className={panelLabelClass}>
        Clic para insertar en el diagrama. Para crear uno nuevo usá la herramienta de captura del sidebar.
      </p>

      <Divider />

      <TextField
        size='small'
        fullWidth
        label='Buscar'
        onChange={(e) => setFilter(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search fontSize='small' />
            </InputAdornment>
          ),
        }}
      />

      {symbols === null ? (
        <div className='flex justify-center py-4'>
          <CircularProgress size={24} />
        </div>
      ) : (
        <List dense className='overflow-y-auto max-h-[360px] !py-0'>
          {filtered.map((symbol) => (
            <ListItem
              key={symbol.id}
              button
              onClick={() => onInsert(symbol)}
              className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
            >
              <ListItemText
                primary={symbol.name}
                secondary={`${symbol.elements?.length || 0} elementos`}
                primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
                secondaryTypographyProps={{ className: 'dark:!text-gray-400' }}
              />
              <IconButton
                size='small'
                sx={{ color: '#ef4444' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(symbol);
                }}
              >
                <DeleteOutline fontSize='small' />
              </IconButton>
            </ListItem>
          ))}
          {!filtered.length && (
            <p className={`${panelLabelClass} px-2 py-1`}>
              Todavía no hay símbolos guardados.
            </p>
          )}
        </List>
      )}
    </Box>
  );
};

export default SymbolSelector;
