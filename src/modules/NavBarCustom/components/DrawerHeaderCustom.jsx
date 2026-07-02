import { styled } from '@mui/material/styles'
const DrawerHeaderCustom = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // debe medir lo mismo que la AppBar (!max-h-11 = 44px) para que el contenido quede pegado
    minHeight: 44,
    height: 44,
}))

export default DrawerHeaderCustom
