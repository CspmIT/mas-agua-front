import { IconButton } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import TableCustom from '../../../components/TableCustom'
import { ColumnsListDiagram } from '../utils/js/ColumnsList'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { request } from '../../../utils/js/request'
import { backend } from '../../../utils/routes/app.routes'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

const ListDrawDiagram = () => {
	const navigate = useNavigate()
	const [listDiagram, setListDiagram] = useState([])
	const editDiagram = (diagram) => {
		navigate(`/newDiagram/${diagram.id}`)
	}
	const getDiagrams = async () => {
		try {
			const list = await request(`${backend[import.meta.env.VITE_APP_NAME]}/getDiagrams`, 'GET')
			setListDiagram(list.data)
		} catch (error) {
			console.error(error)
			Swal.fire({
				title: 'Atención!',
				text: 'Hubo un problema al intentar traer el listado de Diagramas',
				icon: 'error',
			})
		}
	}
	useEffect(() => {
		getDiagrams()
	}, [])

	return (
		<CardCustom
			className={
				'w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'
			}
		>
			<div className='w-full flex flex-col items-center md:p-5'>
				<div className='flex w-full py-2 items-center'>
					<h1 className='text-2xl mb-3 w-full'>Listado de Diagramas</h1>
					<IconButton
						title='Creacion de nuevo diagrama'
						onClick={() => navigate('/newDiagram')}
						className='!bg-blue-400'
						size='small'
					>
						<Add />
					</IconButton>
				</div>
				<div className='w-1/2'>
					<TableCustom
						data={listDiagram}
						columns={ColumnsListDiagram(editDiagram)}
						density='compact'
						header={{
							background: 'rgb(190 190 190)',
							fontSize: '18px',
							fontWeight: 'bold',
							padding: '20px 20px 10px 20px !important',
						}}
						toolbarClass={{ background: 'rgb(190 190 190)' }}
						body={{ backgroundColor: 'rgba(209, 213, 219, 0.31)' }}
						footer={{ background: 'rgb(190 190 190)', padding: '20px !important' }}
						card={{
							boxShadow: `1px 1px 8px 0px #00000046`,
							borderRadius: '0.75rem',
						}}
					/>
				</div>
			</div>
		</CardCustom>
	)
}

export default ListDrawDiagram
