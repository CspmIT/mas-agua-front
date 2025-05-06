import { ArrowBack } from "@mui/icons-material"
import { IconButton, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

const HeaderForms = ({idChart, chart}) => {
    const navigate = useNavigate()
    return (
        <>
            <div className="flex justify-end">
                <IconButton
                    sx={{
                        color: 'black',
                        marginRight: 2,
                        padding: '8px',
                    }}
                    aria-label="volver atrás"
                    onClick={() => {
                        idChart
                            ? navigate('/config/allGraphic')
                            : navigate('/config/graphic')
                    }}
                >
                    <ArrowBack sx={{ fontSize: '1.5rem' }} />
                </IconButton>
            </div>
            <Typography className="text-center !mb-5" variant="h3">
                {idChart
                    ? `Edición del gráfico "${chart?.name || ''}"`
                    : 'Configuración de gráfico'}
            </Typography>
        </>
    )
}

export default HeaderForms
