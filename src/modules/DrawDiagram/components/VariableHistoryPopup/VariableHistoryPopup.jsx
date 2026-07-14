import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import EChart from '../../../Charts/components/EChart';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import {
  floatingPanelSx,
  ghostPillSx,
  panelLabelClass,
  panelTitleClass,
  primaryPillSx,
} from '../../utils/js/diagramTheme';

const RANGES = [
  { key: '-1h', label: '1h', sampling: '1m' },
  { key: '-6h', label: '6h', sampling: '5m' },
  { key: '-24h', label: '24h', sampling: '15m' },
  { key: '-7d', label: '7d', sampling: '2h' },
];

//POPUP CON LA HISTORIA RECIENTE DE UNA VARIABLE (clic en un elemento de la vista)
const VariableHistoryPopup = ({ dataInflux, onClose }) => {
  const [range, setRange] = useState(RANGES[1]);
  const [points, setPoints] = useState(null); // null = cargando

  useEffect(() => {
    let cancelled = false;

    const fetchSeries = async () => {
      setPoints(null);
      try {
        const varsInflux = dataInflux.varsInflux || {};
        const firstKey = Object.keys(varsInflux)[0];
        const vars = varsInflux[firstKey] || {};

        const query = [
          {
            varId: dataInflux.id,
            field: vars.calc_field,
            topic: vars.calc_topic,
            name: dataInflux.name || firstKey,
            type: dataInflux.type || 'mean',
            samplingPeriod: range.sampling,
            typePeriod: 'last',
            dateRange: range.key,
            render: true,
            calc: dataInflux.calc || false,
            equation: dataInflux.equation || null,
            binary_compressed: false,
            id_bit: null,
          },
        ];

        const response = await request(
          `${backend[import.meta.env.VITE_APP_NAME]}/seriesDataInflux`,
          'POST',
          query
        );
        if (cancelled) return;
        setPoints(response?.data?.[dataInflux.id] || []);
      } catch (error) {
        console.error('Error consultando la historia de la variable:', error);
        if (!cancelled) setPoints([]);
      }
    };

    fetchSeries();
    return () => {
      cancelled = true;
    };
  }, [dataInflux, range]);

  const values = (points || []).map((p) => Number(p.value));
  const lastValue = values.length ? values[values.length - 1] : null;
  const unit = dataInflux.unit || '';
  const isLongRange = ['-24h', '-7d'].includes(range.key);

  const chartConfig = {
    grid: { left: 45, right: 14, top: 16, bottom: 26 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: (points || []).map((p) => p.time),
      axisLabel: {
        fontSize: 9,
        formatter: (value) => {
          const [date, time] = String(value).split(', ');
          if (isLongRange) return `${date?.slice(0, 5) || ''} ${time?.slice(0, 5) || ''}`;
          return time || value;
        },
      },
    },
    yAxis: { type: 'value', scale: true, axisLabel: { fontSize: 10 } },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#368bed' },
        itemStyle: { color: '#368bed' },
        areaStyle: { opacity: 0.12, color: '#368bed' },
      },
    ],
  };

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

      <div className='flex gap-1.5'>
        {RANGES.map((r) => (
          <Button
            key={r.key}
            size='small'
            variant={range.key === r.key ? 'contained' : 'outlined'}
            onClick={() => setRange(r)}
            sx={{ ...(range.key === r.key ? primaryPillSx : ghostPillSx), minWidth: 0, px: 1.5 }}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className='h-44 flex items-center justify-center'>
        {points === null ? (
          <CircularProgress size={28} />
        ) : points.length ? (
          <div className='w-full h-full'>
            <EChart config={chartConfig} />
          </div>
        ) : (
          <span className={panelLabelClass}>Sin datos en este período.</span>
        )}
      </div>
    </Box>
  );
};

export default VariableHistoryPopup;
