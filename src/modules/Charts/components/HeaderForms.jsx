import { ArrowBack } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/PageHeader'

const backPillSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.01em',
    px: 2.5,
    py: 1,
    minHeight: 0,
    background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
    boxShadow: '0 4px 14px rgba(44, 106, 160, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2c6aa0 0%, #1f4e79 100%)',
        boxShadow: '0 8px 24px rgba(44, 106, 160, 0.45)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
}

const HeaderForms = ({ idChart, chart, chartName, backTo }) => {
    const navigate = useNavigate()
    const isEdit = !!idChart
    const displayName = chartName?.name || chart?.name || ''
    const target = backTo ?? (isEdit ? '/config/allGraphic' : '/config/graphic')

    const title = isEdit
        ? displayName
            ? `Editando "${displayName}"`
            : 'Edición del gráfico'
        : 'Configuración del gráfico'

    return (
        <PageHeader
            title={title}
            action={
                <Button
                    onClick={() => navigate(target)}
                    variant='contained'
                    disableElevation
                    startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                    sx={backPillSx}
                >
                    Volver
                </Button>
            }
        />
    )
}

export default HeaderForms
