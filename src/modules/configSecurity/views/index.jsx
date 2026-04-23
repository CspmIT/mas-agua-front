import { useNavigate } from 'react-router-dom'
import { Container } from '@mui/material'
import TableCustom from '../../../components/TableCustom'
import { ColumnsUser } from '../utils/DataTable/ColumnsUsers'
import { listUsers } from '../utils/DataTable/dataUser'
import { MainContext } from '../../../context/MainContext'
import { useContext } from 'react'
import EditUserRecloser from '../components/EditUserRecloser/EditUserRecloser'
import PageHeader from '../../../components/PageHeader'

function ConfigSecurity() {
	const { tabs, setTabs, setTabCurrent } = useContext(MainContext)
	const navigate = useNavigate()
	const editUserRecloser = (data) => {
		const existingTabIndex = tabs.findIndex((tab) => tab.name === `Edicion de: ${data.last_name}`)
		if (existingTabIndex !== -1) {
			setTabCurrent(existingTabIndex)
		} else {
			setTabs((prevTabs) => [
				...prevTabs,
				{
					name: `Edicion de: ${data.last_name}`,
					id: data.id,
					link: '/editUserRecloser',
					component: <EditUserRecloser data={data} />,
				},
			])

			setTabCurrent(tabs.length)
		}
		navigate('/tabs')
	}

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			<PageHeader title='Usuarios Mas Agua' />
			<TableCustom
				data={listUsers.filter((usr) => usr.id_profile !== 1)}
				columns={ColumnsUser(editUserRecloser)}
				density='compact'
				topToolbar
				pagination
				pageSize={10}
			/>
		</Container>
	)
}

export default ConfigSecurity
