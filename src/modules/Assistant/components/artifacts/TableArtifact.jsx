import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import ArtifactShell from './ArtifactShell'

/**
 * Render para artifacts type='table'. Reservado por la guía; render
 * mínimo con MUI Table para que cualquier table que llegue se vea bien.
 *
 * @param {{ data: any }} props
 */
const TableArtifact = ({ data }) => {
	const { title = 'Tabla', columns = [], rows = [] } = data

	return (
		<ArtifactShell title={title}>
			<TableContainer
				sx={{
					maxHeight: 320,
					borderRadius: '12px',
					border: '1px solid rgba(31,78,121,0.08)',
				}}
			>
				<Table size='small' stickyHeader>
					<TableHead>
						<TableRow>
							{columns.map((c, i) => (
								<TableCell
									key={i}
									sx={{
										fontSize: 11,
										fontWeight: 700,
										textTransform: 'uppercase',
										letterSpacing: '0.08em',
										color: '#1f4e79',
										background: 'rgba(248,250,252,0.95)',
										borderBottom: '1px solid rgba(31,78,121,0.1)',
									}}
								>
									{c}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length || 1}
									sx={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', py: 3 }}
								>
									Sin filas para mostrar
								</TableCell>
							</TableRow>
						) : (
							rows.map((row, ri) => (
								<TableRow key={ri} hover>
									{row.map((cell, ci) => (
										<TableCell
											key={ci}
											sx={{
												fontSize: 12,
												color: '#334155',
												borderBottom: '1px solid rgba(31,78,121,0.05)',
											}}
										>
											{cell == null ? '—' : String(cell)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</ArtifactShell>
	)
}

export default TableArtifact
