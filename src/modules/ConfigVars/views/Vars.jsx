import { Container, Table } from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import { useEffect, useState } from 'react'

const Vars = () => {
    const [vars, setVars] = useState()
    const [loading, setLoading] = useState()
    const getVars = async () => {

    }
    useEffect(()=>{
        getVars()
    }, [])
    return (
        <Container>
            
            <TableCustom
                data={[]}
                columns={[
                    { header: 'ID', accessorKey: 'id' },
                    { header: 'Nombre', accessorKey: 'name' },
                    { header: 'Opciones', accessorKey: 'options' },
                ]}
            />
        </Container>
    )
}

export default Vars
