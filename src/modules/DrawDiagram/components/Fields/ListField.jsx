import { Add, Edit, Search } from '@mui/icons-material'
import { Divider, IconButton, InputAdornment, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import ModalVar from '../../../../components/DataGenerator/ModalVar'
import { getVarsInflux } from './actions'

function ListField() {
	const [listVariable, setListVariable] = useState([])
	const [listfilter, setListfilter] = useState([])
	const [varSelected, setVarSelected] = useState(null)
	const [openModal, setOpenModal] = useState(false)

	const setVariables = async () => {
		const variables = await getVarsInflux()
		setListfilter(variables)
		setListVariable(variables)
	}

	useEffect(() => {
		setVariables()
	}, [openModal])

	const filter = (text) => {
		setListfilter(listVariable.filter((variable) => variable.name.includes(`${text}`)))
	}

	return (
		<div className={`w-full h-full pt-4 bg-white `}>
			<div className='flex w-full justify-center items-center mb-4 relative'>
				<ModalVar openModal={openModal} setOpenModal={setOpenModal} data={varSelected} />

				<Typography className='text-center uppercase !font-bold ' typography={'h6'}>
					variables
				</Typography>
				<IconButton
					color='primary'
					className='!bg-blue-200 !absolute top-0 right-5'
					onClick={() => {
						setOpenModal(true)
						setVarSelected(null)
					}}
				>
					<Add />
				</IconButton>
			</div>
			<Divider />
			<div className={`w-full p-3 flex flex-col gap-3 h-full overflow-y-auto `}>
				<TextField
					onChange={(e) => filter(e.target.value)}
					label='Buscar'
					variant='outlined'
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Search />
							</InputAdornment>
						),
					}}
				/>
				{listVariable.length ? (
					<List dense={false}>
						{listfilter.map((variable, index) => (
							<ListItem key={index} onDrag={null}>
								<ListItemText primary={variable.name} />
								<IconButton
									color='warning'
									className='!bg-yellow-200'
									onClick={() => {
										setVarSelected(variable)
										setOpenModal(true)
									}}
								>
									<Edit />
								</IconButton>
							</ListItem>
						))}
					</List>
				) : null}
			</div>
		</div>
	)
}
export default ListField
