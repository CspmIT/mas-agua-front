import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { LuExternalLink } from 'react-icons/lu';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
} from '../../utils/js/diagramTheme';

//EDITOR DEL BOTON DE NAVEGACION: etiqueta y diagrama destino (drill-down)
const LinkDiagramPanel = ({ button, currentDiagramId, onChange }) => {
  const [diagrams, setDiagrams] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        const response = await request(`${backend[import.meta.env.VITE_APP_NAME]}/getDiagrams`, 'GET');
        const list = (response?.data || []).filter(
          (d) => d.status && String(d.id) !== String(currentDiagramId)
        );
        setDiagrams(list);
      } catch (error) {
        console.error('Error obteniendo diagramas:', error);
      }
    };
    fetchDiagrams();
  }, [currentDiagramId]);

  if (!button || button.type !== 'linkButton') return null;

  const currentLink = button.linkDiagram;
  const currentLinkTitle = diagrams.find((d) => String(d.id) === String(currentLink))?.title;
  const filtered = diagrams.filter((d) =>
    d.title?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={floatingPanelSx} className='absolute left-2 top-2 z-10 w-72 p-3 flex flex-col gap-3'>
      <h4 className={panelTitleClass}>Botón de navegación</h4>

      <TextField
        size='small'
        label='Etiqueta'
        value={button.config?.label || ''}
        onChange={(e) => onChange({ ...button, config: { ...button.config, label: e.target.value } })}
        fullWidth
      />

      {currentLink ? (
        <div className='flex items-center justify-between gap-2 rounded-lg bg-[#2c6aa0]/10 dark:bg-[#5ea5f0]/15 px-2.5 py-1.5'>
          <span className='text-sm text-slate-800 dark:text-gray-100 truncate'>
            <LuExternalLink className='inline mr-1.5' size={14} />
            {currentLinkTitle || `Diagrama #${currentLink}`}
          </span>
          <Button
            size='small'
            variant='outlined'
            sx={{ ...ghostPillSx, flexShrink: 0 }}
            onClick={() => onChange({ ...button, linkDiagram: null })}
          >
            Quitar
          </Button>
        </div>
      ) : (
        <p className={panelLabelClass}>Elegí el diagrama que se abre al hacer clic:</p>
      )}

      <Divider />

      <TextField
        size='small'
        fullWidth
        label='Buscar diagrama'
        onChange={(e) => setFilter(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Search fontSize='small' />
            </InputAdornment>
          ),
        }}
      />

      <List dense className='overflow-y-auto max-h-[300px] !py-0'>
        {filtered.map((diagram) => (
          <ListItem
            key={diagram.id}
            button
            selected={String(diagram.id) === String(currentLink)}
            onClick={() => onChange({ ...button, linkDiagram: diagram.id })}
            className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
          >
            <ListItemText
              primary={diagram.title}
              primaryTypographyProps={{ className: 'text-slate-800 dark:!text-gray-100' }}
            />
          </ListItem>
        ))}
        {!filtered.length && (
          <p className={`${panelLabelClass} px-2 py-1`}>No hay otros diagramas disponibles.</p>
        )}
      </List>
    </Box>
  );
};

export default LinkDiagramPanel;
