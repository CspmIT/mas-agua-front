import { Button, MenuItem, TextField } from '@mui/material'
import { useState } from 'react'
import Swal from 'sweetalert2'

const samplingOptions = {
    '<1d': ["1s", "5s", "10s", "1m", "5m", "15m", "30m", "1h", "3h", "6h", "12h", "1d"],
    '1d-7d': ["15m", "30m", "1h", "3h", "6h", "12h", "1d"],
    '8d-1mo': ["30m", "1h", "3h", "6h", "12h", "1d", "15d", "1mo"],
    '1mo-6mo': ["3h", "6h", "12h", "1d", "15d", "1mo"],
    '>6mo': ["12h", "1d", "15d", "1mo"]
};

const getSamplingOptions = (dateRange) => {
    if (dateRange === "-1d") return samplingOptions['<1d'];
    if (["-7d"].includes(dateRange)) return samplingOptions['1d-7d'];
    if (["-30d"].includes(dateRange)) return samplingOptions['8d-1mo'];
    if (["-3mo", "-6mo"].includes(dateRange)) return samplingOptions['1mo-6mo'];
    return samplingOptions['>6mo'];
};

const FiltersChart = ({ id_chart, setFilters }) => {
    const [dateRange, setDateRange] = useState('')
    const [samplingPeriod, setSamplingPeriod] = useState('')

    const applyFilters = () => {
        if (!dateRange || !samplingPeriod) {
            Swal.fire({
                icon: 'error',
                title: 'Atención!',
                html: "Debe seleccionar valor desde y tiempo de muestreo"
            })
            return
        }
        setFilters((prevFilters) => ({
            ...prevFilters,
            [id_chart]: { dateRange, samplingPeriod },
        }))
    }

    const clearFilters = () => {
        setDateRange('')
        setSamplingPeriod('')
        setFilters((prevFilters) => ({
            ...prevFilters,
            [id_chart]: { dateRange: '', samplingPeriod: '' },
        }))
    }

    return (
        <div className="grid grid-cols-3 gap-3 items-center mt-3 w-4/5">
            <h3 className="col-span-3 text-center">Zoom del gráfico</h3>

            <TextField
                label="Valores desde"
                select
                value={dateRange}
                onChange={(e) => {
                    setDateRange(e.target.value);
                    setSamplingPeriod(''); // Reset sampling when changing date range
                }}
                fullWidth
            >
                <MenuItem value={'-1d'}>Último día</MenuItem>
                <MenuItem value={'-7d'}>Últimos 7 días</MenuItem>
                <MenuItem value={'-30d'}>Últimos 30 días</MenuItem>
                <MenuItem value={'-3mo'}>Últimos 3 meses</MenuItem>
                <MenuItem value={'-6mo'}>Últimos 6 meses</MenuItem>
                <MenuItem value={'-1y'}>Último 1 año</MenuItem>
            </TextField>

            <TextField
                select
                value={samplingPeriod}
                onChange={(e) => setSamplingPeriod(e.target.value)}
                fullWidth
                label="Tiempo de muestreo"
                disabled={!dateRange}
            >
                {getSamplingOptions(dateRange).map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>

            <div className="flex gap-3">
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={applyFilters}
                    disabled={!dateRange || !samplingPeriod}
                >
                    Aplicar
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={clearFilters}
                >
                    Limpiar
                </Button>
            </div>
        </div>
    )
}

export default FiltersChart
