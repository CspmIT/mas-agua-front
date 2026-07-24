import React, { useEffect, useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import EChart from '../../../Charts/components/EChart';
import { request } from '../../../../utils/js/request';
import { backend } from '../../../../utils/routes/app.routes';
import { ghostPillSx, panelLabelClass, primaryPillSx } from '../../utils/js/diagramTheme';

const RANGES = [
  { key: '-1h', label: '1h', sampling: '1m' },
  { key: '-6h', label: '6h', sampling: '5m' },
  { key: '-24h', label: '24h', sampling: '15m' },
  { key: '-7d', label: '7d', sampling: '2h' },
];

// Pills de rango + minigráfico con la historia reciente de una variable Influx.
// Compartido entre el popup de diagramas/mapas y el dashboard de presiones.
// `onWhite`: fuerza estilos claros para contenedores siempre blancos (ignora el dark mode).
const VariableHistoryChart = ({ dataInflux, heightClass = 'h-44', onWhite = false, onPointsLoaded }) => {
  const [range, setRange] = useState(RANGES[1]);
  const [points, setPoints] = useState(null); // null = cargando

  const onPointsLoadedRef = useRef(onPointsLoaded);
  onPointsLoadedRef.current = onPointsLoaded;

  useEffect(() => {
    onPointsLoadedRef.current?.(points);
  }, [points]);

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

  const ghostSx = onWhite ? { ...ghostPillSx, 'body.dark &': {} } : ghostPillSx;
  const emptyLabelClass = onWhite ? 'text-xs font-medium text-slate-600' : panelLabelClass;

  return (
    <>
      <div className='flex gap-1.5'>
        {RANGES.map((r) => (
          <Button
            key={r.key}
            size='small'
            variant={range.key === r.key ? 'contained' : 'outlined'}
            onClick={() => setRange(r)}
            sx={{ ...(range.key === r.key ? primaryPillSx : ghostSx), minWidth: 0, px: 1.5 }}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className={`${heightClass} flex items-center justify-center`}>
        {points === null ? (
          <CircularProgress size={28} />
        ) : points.length ? (
          <div className='w-full h-full'>
            <EChart config={chartConfig} />
          </div>
        ) : (
          <span className={emptyLabelClass}>Sin datos en este período.</span>
        )}
      </div>
    </>
  );
};

export default VariableHistoryChart;
