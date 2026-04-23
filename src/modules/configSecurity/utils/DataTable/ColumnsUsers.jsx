import React, { useState } from 'react'
import { Circle, Visibility, VisibilityOff } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { ActionsRow, EditChip } from '../../../../components/TableActions'

const profile = {
	1: 'Super Admin',
	2: 'Moderador',
	3: 'Lector',
	4: 'Operador',
}

export const ColumnsUser = (editUserRecloser) => [
	{
		header: 'Nombre',
		accessorKey: 'first_name',
		Cell: ({ row }) => {
			return <p className='m-0 p-0 ml-2 text-base'>{`${row.original?.first_name} ${row.original?.last_name}`}</p>
		},
		size: 300,
	},
	{
		header: 'Email',
		accessorKey: 'email',
	},
	{
		header: 'Perfil',
		accessorKey: 'id_profile',
		Cell: ({ row }) => {
			return <p className='m-0 p-0 ml-2 text-base'>{`${profile[row.original?.id_profile]}`}</p>
		},
	},
	{
		header: 'Contraseña',
		accessorKey: 'password',
		Cell: ({ row }) => {
			const [showPassword, setShowPassword] = useState(false)

			return (
				<div className='flex items-center'>
					<p className='m-0 p-0 mr-5 text-base'>{showPassword ? row.original?.password : '••••••••'}</p>
					<IconButton onClick={() => setShowPassword(!showPassword)} className=' !text-black !shadow-md'>
						{showPassword ? <VisibilityOff /> : <Visibility />}
					</IconButton>
				</div>
			)
		},
	},
	{
		header: 'Estado',
		accessorKey: 'status',
		Cell: ({ row }) => {
			return (
				<div className='flex items-center w-full'>
					<Circle color={row.original?.status > 0 ? 'success' : 'error'} />
					<p className='m-0 p-0 ml-2 text-base'>{`${
						row.original?.status > 0 ? 'Habilitado' : 'Deshabilitado'
					}`}</p>
				</div>
			)
		},
	},
	{
		header: 'Acciones',
		accessorKey: 'actions',
		size: 120,
		enableSorting: false,
		enableColumnFilter: false,
		enableClickToCopy: false,
		Cell: ({ row }) => (
			<ActionsRow>
				<EditChip onClick={() => editUserRecloser(row.original)} />
			</ActionsRow>
		),
	},
]
