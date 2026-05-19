import { Add, Edit, Search } from '@mui/icons-material'
import {
	Box,
	Divider,
	IconButton,
	InputAdornment,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import ModalVar from '../../../../components/DataGenerator/ModalVar'
import { getVarsInflux } from './actions'
import { floatingPanelSx, iconButtonPrimarySx } from '../../utils/js/diagramTheme'

function ListField({ onSelectVariable, onClose }) {
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
		const lowered = text.toLowerCase()
		setListfilter(
			listVariable.filter((variable) => variable.name.toLowerCase().includes(lowered))
		)
	}

	return (
		<Box sx={floatingPanelSx} className='w-full p-3 flex flex-col gap-3'>
			<ModalVar openModal={openModal} setOpenModal={setOpenModal} data={varSelected} />

			<div className='flex items-center justify-between'>
				<Typography
					typography={'subtitle1'}
					className='uppercase !font-semibold !tracking-tight text-slate-800 dark:!text-gray-100'
				>
					Variables
				</Typography>
				<IconButton
					size='small'
					sx={iconButtonPrimarySx}
					onClick={() => {
						setOpenModal(true)
						setVarSelected(null)
					}}
				>
					<Add fontSize='small' />
				</IconButton>
			</div>

			<Divider />

			<TextField
				size='small'
				fullWidth
				onChange={(e) => filter(e.target.value)}
				label='Buscar'
				variant='outlined'
				InputProps={{
					endAdornment: (
						<InputAdornment position='end'>
							<Search fontSize='small' />
						</InputAdornment>
					),
				}}
			/>

			{listVariable.length ? (
				<List dense className='overflow-y-auto max-h-[400px] !py-0'>
					{listfilter.map((variable, index) => (
						<ListItem
							key={index}
							button
							onClick={() => {
								onSelectVariable(variable)
								onClose?.()
							}}
							className='!rounded-md hover:!bg-[#2c6aa0]/10 dark:hover:!bg-[#5ea5f0]/15'
						>
							<ListItemText
								primary={variable.name}
								primaryTypographyProps={{
									className: 'text-slate-800 dark:!text-gray-100',
								}}
							/>
							<IconButton
								size='small'
								color='warning'
								className='!bg-yellow-100 dark:!bg-yellow-900/40'
								onClick={(e) => {
									e.stopPropagation()
									setVarSelected(variable)
									setOpenModal(true)
								}}
							>
								<Edit fontSize='small' />
							</IconButton>
						</ListItem>
					))}
				</List>
			) : null}
		</Box>
	)
}

export default ListField
