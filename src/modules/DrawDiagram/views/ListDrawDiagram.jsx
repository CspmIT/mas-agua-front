import { IconButton } from '@mui/material'
import CardCustom from '../../../components/CardCustom'
import TableCustom from '../../../components/TableCustom'
import { ColumnsListDiagram } from '../utils/js/ColumnsList'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const ListDrawDiagram = () => {
	const navigate = useNavigate()
	const editDiagram = (id) => {
		console.log(id)
	}

	return (
		<CardCustom
			className={
				'w-full h-full flex flex-col items-center justify-center text-black dark:text-white relative p-3 rounded-md'
			}
		>
			<div className='w-full  md:p-5'>
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

				<TableCustom
					data={[]}
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
		</CardCustom>
	)
}

export default ListDrawDiagram
