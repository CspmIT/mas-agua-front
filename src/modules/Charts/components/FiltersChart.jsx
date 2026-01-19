import { Button, MenuItem, TextField } from '@mui/material'
import { useState } from 'react'
import Swal from 'sweetalert2'
import CardCustom from '../../../components/CardCustom'

const samplingOptions = {
    '<1d': ["1s", "5s", "10s", "1m", "5m", "15m", "30m", "1h", "3h", "6h", "12h", "1d"],
    '1d-7d': ["15m", "30m", "1h", "3h", "6h", "12h", "1d"],
    '8d-1mo': ["30m", "1h", "3h", "6h", "12h", "1d", "15d", "1mo"],
    '1mo-6mo': ["3h", "6h", "12h", "1d", "15d", "1mo"],
    '>6mo': ["12h", "1d", "15d", "1mo"]
};

const getSamplingOptions = (dateRange, mode) => {
    if (mode === 'absolute') return samplingOptions['<1d'];
    if (dateRange === "-1d") return samplingOptions['<1d'];
    if (["-7d"].includes(dateRange)) return samplingOptions['1d-7d'];
    if (["-30d"].includes(dateRange)) return samplingOptions['8d-1mo'];
    if (["-3mo", "-6mo"].includes(dateRange)) return samplingOptions['1mo-6mo'];
    return samplingOptions['>6mo'];
};

const FiltersChart = ({ id_chart, setFilters }) => {
    const [mode, setMode] = useState('relative')
    const [dateRange, setDateRange] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [samplingPeriod, setSamplingPeriod] = useState('')

    const applyFilters = () => {
        if (!samplingPeriod) {
            Swal.fire('Error', 'Seleccione tiempo de muestreo', 'error')
            return
        }

        if (mode === 'relative' && !dateRange) {
            Swal.fire('Error', 'Seleccione un rango relativo', 'error')
            return
        }

        if (mode === 'absolute' && (!dateFrom || !dateTo)) {
            Swal.fire('Error', 'Seleccione fecha desde y hasta', 'error')
            return
        }

        if (mode === 'absolute' && dateFrom >= dateTo) {
            Swal.fire('Error', 'La fecha desde debe ser menor a la fecha hasta', 'error')
            return
        }

        setFilters(prev => ({
            ...prev,
            [id_chart]: {
                type: mode,
                dateRange,
                dateFrom,
                dateTo,
                samplingPeriod,
            },
        }))
    }

    const clearFilters = () => {
        setMode('relative')
        setDateRange('')
        setDateFrom('')
        setDateTo('')
        setSamplingPeriod('')

        setFilters(prev => ({
            ...prev,
            [id_chart]: {},
        }))
    }

    return (
        <>
            <CardCustom className="w-5/6 bg-slate-100 p-4 rounded-md border-2 border-slate-200 shadow-md shadow-slate-100 items-center">
                <div className={`grid ${mode === 'relative' ? 'grid-cols-4' : 'grid-cols-5'} gap-3 items-center`}>
                    <TextField
                        select
                        label="Tipo de rango"
                        value={mode}
                        onChange={(e) => {
                            setMode(e.target.value)
                            setDateRange('')
                            setDateFrom('')
                            setDateTo('')
                        }}
                        fullWidth
                    >
                        <MenuItem value="relative">Relativo</MenuItem>
                        <MenuItem value="absolute">Personalizado</MenuItem>
                    </TextField>

                    {mode === 'relative' ? (
                        <TextField
                            select
                            label="Valores desde"
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value)
                                setSamplingPeriod('')
                            }}
                            fullWidth
                        >
                            <MenuItem value="-1d">Últimas 24hs</MenuItem>
                            <MenuItem value="-7d">Últimos 7 días</MenuItem>
                            <MenuItem value="-30d">Últimos 30 días</MenuItem>
                            <MenuItem value="-3mo">Últimos 3 meses</MenuItem>
                            <MenuItem value="-6mo">Últimos 6 meses</MenuItem>
                            <MenuItem value="-1y">Último año</MenuItem>
                        </TextField>
                    ) : (
                        <>
                            <TextField
                                type="datetime-local"
                                label="Fecha desde"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                type="datetime-local"
                                label="Fecha hasta"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </>
                    )}

                    <TextField
                        select
                        label="Tiempo de muestreo"
                        value={samplingPeriod}
                        onChange={(e) => setSamplingPeriod(e.target.value)}
                        fullWidth
                    >
                        {getSamplingOptions(dateRange, mode).map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </TextField>


                    <div className="flex gap-3 items-center justify-center">
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={applyFilters}
                            // disabled={!dateRange || !samplingPeriod}
                        >
                            Aplicar
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={clearFilters}
                        >
                            Limpiar
                        </Button>
                    </div>
                </div>
            </CardCustom>
        </>
    )
}

export default FiltersChart
