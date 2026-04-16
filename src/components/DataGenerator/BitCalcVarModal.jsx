import { useState, useEffect } from 'react';
import {
  Modal, Box, IconButton, Button, TextField,
  MenuItem, Typography, Paper, Chip, Stepper,
  Step, StepLabel, Divider
} from '@mui/material';
import { Close, Add, Delete } from '@mui/icons-material';
import { request } from '../../utils/js/request';
import { backend } from '../../utils/routes/app.routes';
import Swal from 'sweetalert2';

const IMAGE_OPTIONS = [
  { value: 'default', label: 'Apagado (gris)' },
  { value: 'success', label: 'Encendido (verde)' },
  { value: 'error', label: 'En falla (rojo)' },
];

export default function BitCalcVarModal({ open, onClose, data = null, onSaved }) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('calc_binary');
  const [process, setProcess] = useState('');
  const [type, setType] = useState('last');
  const [allBCVars, setAllBCVars] = useState([]);
  const [sources, setSources] = useState([]);

  const [pendingVarId, setPendingVarId] = useState('');
  const [pendingBitId, setPendingBitId] = useState('');

  const [results, setResults] = useState({});

  // ── Cargar variables BC disponibles ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    request(`${backend[import.meta.env.VITE_APP_NAME]}/getVarsInflux`, 'GET')
      .then(res => {
        // Filtramos solo las que son binary_compressed
        const bcVars = (res.data || []).filter(v => v.binary_compressed === true && v.calc_binary_compressed === false);
        setAllBCVars(bcVars);
      })
      .catch(() => { });
  }, [open]);

  // ── Cargar datos si es edición ──────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setUnit(data.unit || 'calc_binary');
    setType(data.type || 'last');
    setProcess(data.process);
    setSources(data.sources || []);
    setResults(data.results || {});
  }, [data]);

  // ── Regenerar tabla cuando cambian las fuentes ──────────────────────────────
  useEffect(() => {
    if (!sources.length) return;
    const count = Math.pow(2, sources.length);
    setResults(prev => {
      const next = {};
      for (let i = 0; i < count; i++) {
        next[String(i)] = prev[String(i)] ?? { image: 'default', label: '' };
      }
      return next;
    });
  }, [sources]);

  // ── La var seleccionada actualmente ────────────────────────────────────────
  const selectedVar = allBCVars.find(v => v.id === Number(pendingVarId)) ?? null;

  // ── Agregar fuente ──────────────────────────────────────────────────────────
  const handleAddSource = () => {
    if (!selectedVar || pendingBitId === '') return;

    // bits del back: { id, id_var, name, bit }
    const bitObj = selectedVar.bits?.find(b => String(b.id) === String(pendingBitId));
    if (!bitObj) return;

    const already = sources.some(
      s => s.id_var === selectedVar.id && s.id_bit === bitObj.id
    );
    if (already) {
      Swal.fire({ icon: 'warning', title: 'Ya agregado', text: 'Ese bit ya está en las fuentes' });
      return;
    }

    // La config de Influx viene en varsInflux[varName]
    // Como solo hay una key (el nombre de la variable), tomamos el primer valor
    const influx_config = Object.values(selectedVar.varsInflux)[0];

    setSources(prev => [...prev, {
      id_var: selectedVar.id,
      var_name: selectedVar.name,
      id_bit: bitObj.id,
      bit_name: bitObj.name,
      bit_position: bitObj.bit,   // posición real del bit en el byte (0-7)
      influx_config,               // { calc_topic, calc_field, calc_time, ... }
    }]);

    setPendingVarId('');
    setPendingBitId('');
  };

  // ── Fila de la tabla de verdad ──────────────────────────────────────────────
  const renderTruthRow = (index) => {
    const bits = sources.map((_, i) => (index >> i) & 1);
    const row = results[String(index)] ?? { image: 'default', label: '' };

    return (
      <div
        key={index}
        className="grid gap-2 items-center py-2 border-b last:border-0"
        style={{ gridTemplateColumns: 'auto 1fr 1fr auto' }}
      >
        {/* Bits de entrada */}
        <div className="flex gap-1 flex-wrap min-w-fit">
          {bits.map((b, i) => (
            <Chip
              key={i}
              label={`${sources[i].bit_name}=${b}`}
              size="small"
              color={b ? 'success' : 'default'}
              variant="outlined"
            />
          ))}
        </div>

        {/* Imagen resultante */}
        <TextField
          select size="small" label="Imagen"
          value={row.image}
          onChange={(e) => setResults(prev => ({
            ...prev,
            [String(index)]: { ...prev[String(index)], image: e.target.value }
          }))}
        >
          {IMAGE_OPTIONS.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>

        {/* Etiqueta descriptiva */}
        <TextField
          size="small" label="Etiqueta"
          value={row.label}
          placeholder="Ej: Bomba encendida"
          onChange={(e) => setResults(prev => ({
            ...prev,
            [String(index)]: { ...prev[String(index)], label: e.target.value }
          }))}
        />

        {/* Índice decimal — referencia visual */}
        <Chip label={String(index)} size="small" color="info" />
      </div>
    );
  };

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name || !process) {
      Swal.fire({ icon: 'error', title: 'Faltan datos', text: 'Nombre y proceso son requeridos' });
      return;
    }
    if (!sources.length) {
      Swal.fire({ icon: 'error', title: 'Sin fuentes', text: 'Agregá al menos una variable binaria' });
      return;
    }
    // Construimos varsInflux agrupando por var_name con su influx_config
    // Si dos sources vienen de la misma variable, tienen la misma config
    const varsInflux = sources.reduce((acc, s) => {
      if (!acc[s.var_name]) {
        acc[s.var_name] = s.influx_config;
      }
      return acc;
    }, {});

    try {
      await request(
        `${backend[import.meta.env.VITE_APP_NAME]}/bitCalcVars/save`,
        'POST',
        {
          id: data?.id || 0,
          name,
          unit,
          type,       
          process,
          varsInflux,  
          sources,
          results,
        }
      );
      Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
      onSaved?.();
      onClose();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al guardar' });
    }
  };

  const steps = ['Info básica', 'Variables de entrada', 'Tabla de resultados'];

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box className="relative bg-white rounded-xl p-6 min-w-[90vw] max-w-[94vw] overflow-y-auto">
        <IconButton onClick={onClose} className="!absolute top-3 right-3">
          <Close color="error" />
        </IconButton>

        <Typography variant="h5" align="center" className="!mb-4">
          Variable calculada — bits comprimidos
        </Typography>

        <Stepper activeStep={step} className="!mb-6">
          {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {/* ── PASO 1 ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4 items-center">
            <TextField
              label="Nombre de la variable" value={name} size="small"
              className="w-2/3" required
              onChange={e => setName(e.target.value)}
            />
            <TextField
              label="Proceso" value={process} size="small"
              className="w-2/3" required
              onChange={e => setProcess(e.target.value)}
            />
            <TextField
              label="Unidad de medida" value="calc_binary" size="small"
              className="w-2/3" disabled
              onChange={e => setUnit(e.target.value)}
            />
            <TextField
              select label="Tipo de consulta" value={type} size="small"
              className="w-2/3" disabled
              onChange={e => setType(e.target.value)}
            >
              <MenuItem value="last">Instantánea</MenuItem>
              <MenuItem value="history">Histórico</MenuItem>
            </TextField>
          </div>
        )}

        {/* ── PASO 2 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Typography variant="subtitle2" color="text.secondary">
              Seleccioná hasta 4 variables binarias comprimidas y el bit de cada una.
              El orden define la posición del bit en el índice de resultado (fuente 0 → bit 0, etc.).
            </Typography>

            {/* Fuentes ya agregadas */}
            {sources.map((s, i) => (
              <Paper key={i} variant="outlined" className="flex items-center justify-between px-3 py-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <Chip label={`Bit ${i} (peso ${Math.pow(2, i)})`} size="small" color="info" />
                  <Typography variant="body2">
                    <strong>{s.var_name}</strong> → <strong>{s.bit_name}</strong>
                    <span className="text-gray-400 text-xs ml-1">(posición {s.bit_position} del byte)</span>
                  </Typography>
                </div>
                <IconButton
                  size="small" color="error"
                  onClick={() => setSources(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            ))}

            {/* Selector de nueva fuente */}
            {sources.length < 4 && (
              <Paper variant="outlined" className="p-3 flex flex-col gap-3">
                <Typography variant="caption" color="text.secondary">
                  Agregar fuente
                </Typography>
                <div className="flex gap-2 flex-wrap">
                  {/* Selector de variable */}
                  <TextField
                    select label="Variable binaria" size="small"
                    className="flex-1 min-w-[200px]"
                    value={pendingVarId}
                    onChange={e => {
                      setPendingVarId(e.target.value);
                      setPendingBitId(''); // resetear bit al cambiar var
                    }}
                  >
                    {allBCVars.map(v => (
                      <MenuItem key={v.id} value={String(v.id)}>
                        {v.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Selector de bit — muestra name + posición del byte */}
                  <TextField
                    select label="Bit" size="small"
                    className="flex-1 min-w-[180px]"
                    value={pendingBitId}
                    onChange={e => setPendingBitId(e.target.value)}
                    disabled={!selectedVar}
                  >
                    {(selectedVar?.bits ?? []).map(b => (
                      <MenuItem key={b.id} value={String(b.id)}>
                        {b.name} (bit {b.bit})
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="contained" size="small"
                    startIcon={<Add />}
                    disabled={!pendingVarId || pendingBitId === ''}
                    onClick={handleAddSource}
                  >
                    Agregar
                  </Button>
                </div>
              </Paper>
            )}
          </div>
        )}

        {/* ── PASO 3 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <Typography variant="subtitle2" color="text.secondary">
              Con {sources.length} bit(s) hay {Math.pow(2, sources.length)} combinaciones.
              Asigná imagen y etiqueta a cada una.
            </Typography>
            <Divider />
            {Array.from({ length: Math.pow(2, sources.length) }, (_, i) => renderTruthRow(i))}
          </div>
        )}

        {/* ── Navegación ── */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outlined"
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
          >
            Anterior
          </Button>
          {step < 2
            ? <Button variant="contained" onClick={() => setStep(s => s + 1)}>
              Siguiente
            </Button>
            : <Button variant="contained" color="success" onClick={handleSave}>
              Guardar
            </Button>
          }
        </div>
      </Box>
    </Modal>
  );
}