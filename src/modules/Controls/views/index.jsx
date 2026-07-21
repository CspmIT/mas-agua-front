import { useContext } from 'react'
import { Container, Tabs, Tab, Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { MainContext } from '../../../context/MainContext'
import PumpsTable from '../../PumpsTable/views'
import PumpGenibus from '../../PumpGenibus/views'

// Clientes que tienen el bombeo urbano Genibus (las pestañas de salida solo
// aparecen para ellos; el resto de los tenants ve solo el bombeo de succion)
const GENIBUS_CLIENTS = ['coopmorteros', 'Coop desarrollo 2']

// Placeholder de la salida industrial hasta que se implemente
const ComingSoon = () => (
    <Box className="rounded-3xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 p-12 text-center">
        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Salida industrial
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
            Próximamente: control del bombeo de la salida industrial.
        </p>
    </Box>
)

const TABS = [
    { key: 'succion', label: 'Bombeo de succión', render: () => <PumpsTable embedded /> },
    { key: 'urbana', label: 'Salida urbana', render: () => <PumpGenibus embedded />, clients: GENIBUS_CLIENTS },
    { key: 'industrial', label: 'Salida industrial', render: () => <ComingSoon />, clients: GENIBUS_CLIENTS },
]

const tabsSx = {
    minHeight: 42,
    mb: 2.5,
    borderBottom: '1px solid',
    borderColor: 'rgba(148, 163, 184, 0.25)',
    '& .MuiTabs-indicator': {
        height: 3,
        borderRadius: '3px 3px 0 0',
        backgroundColor: '#368bed',
    },
    '& .MuiTab-root': {
        minHeight: 42,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#64748b',
        'body.dark &': { color: '#9ca3af' },
        '&.Mui-selected': {
            color: '#368bed',
            'body.dark &': { color: '#5ea5f0' },
        },
    },
}

// Vista unificada de controles de bombeo: cada pestaña monta la vista
// correspondiente en modo embebido. La pestaña activa vive en la URL
// (/controls/:tab) para poder linkear y recargar sin perder la seleccion.
const Controls = () => {
    const { tab } = useParams()
    const navigate = useNavigate()
    const { client } = useContext(MainContext)

    const visibleTabs = TABS.filter((t) => !t.clients || t.clients.includes(client))
    const active = visibleTabs.find((t) => t.key === tab) ?? visibleTabs[0]

    return (
        <Container maxWidth={false} disableGutters className="w-full px-3 sm:px-5 pt-2 pb-4">
            <Tabs
                value={active.key}
                onChange={(_, value) => navigate(`/controls/${value}`)}
                variant="fullWidth"
                sx={tabsSx}
            >
                {visibleTabs.map(({ key, label }) => (
                    <Tab key={key} value={key} label={label} />
                ))}
            </Tabs>

            {active.render()}
        </Container>
    )
}

export default Controls
