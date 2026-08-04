import { useState } from 'react'
import { Container, Tabs, Tab } from '@mui/material'
import PageHeader from '../../../components/PageHeader'
import AuditDashboard from '../components/AuditDashboard'
import AuditMovements from '../components/AuditMovements'

const tabsSx = {
	minHeight: 42,
	mb: 2,
	borderBottom: '1px solid',
	borderColor: 'rgba(148, 163, 184, 0.25)',
	'& .MuiTabs-indicator': {
		height: 3,
		borderRadius: '3px 3px 0 0',
		backgroundColor: '#368bed',
	},
	'& .MuiTab-root': {
		minHeight: 42,
		textTransform: 'none',
		fontWeight: 600,
		fontSize: '0.9rem',
		color: '#64748b',
		'body.dark &': { color: '#9ca3af' },
		'&.Mui-selected': {
			color: '#368bed',
			'body.dark &': { color: '#5ea5f0' },
		},
	},
}

function ActionAudit() {
	const [tab, setTab] = useState('dashboard')

	return (
		<Container maxWidth={false} disableGutters className='w-full px-3 sm:px-5 pt-2 pb-4'>
			<PageHeader title='Auditoría de acciones' />

			<Tabs value={tab} onChange={(_, value) => setTab(value)} sx={tabsSx}>
				<Tab value='dashboard' label='Dashboard' />
				<Tab value='movimientos' label='Movimientos' />
			</Tabs>

			{tab === 'dashboard' && <AuditDashboard />}
			{tab === 'movimientos' && <AuditMovements />}
		</Container>
	)
}

export default ActionAudit
