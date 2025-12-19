import {
	MRT_ExpandButton,
	MRT_GlobalFilterTextField,
	MRT_ShowHideColumnsButton,
	MRT_TablePagination,
	MRT_ToggleDensePaddingButton,
	MRT_ToggleFiltersButton,
	MRT_ToggleGlobalFilterButton,
	MaterialReactTable,
	useMaterialReactTable,
} from 'material-react-table'
import NoRegisterTable from './NoRegisterTable'
import { storage } from '../../storage/storage'
import { Box, IconButton, Tooltip } from '@mui/material'
import { PiBroomFill } from 'react-icons/pi'
import { useEffect } from 'react'
import { SiMicrosoftexcel } from 'react-icons/si'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaFilePdf } from 'react-icons/fa'

const csvConfig = mkConfig({
	filename: 'Excel-export',
	fieldSeparator: ',',
	decimalSeparator: '.',
	useKeysAsHeaders: true,
})

const TableCustom = ({ data, columns, ...prop }) => {
	// // exportar en excel por linea
	// const handleExportRows = (rows) => {
	// 	const rowData = rows.map((row) => row.original)
	// 	const csv = generateCsv(csvConfig)(rowData)
	// 	download(csvConfig)(csv)
	// }
	// exportar en excel toda la info
	const handleExportData = () => {
		const getFlattenedHeadersAndKeys = (cols) => {
			const flattened = []
			cols.forEach((column) => {
				if (column.columns) {
					flattened.push(...getFlattenedHeadersAndKeys(column.columns))
				} else {
					flattened.push({ header: column.header, accessorKey: column.accessorKey })
				}
			})
			return flattened
		}

		const flattenedColumns = getFlattenedHeadersAndKeys(columns)
		const groupedHeaders = []
		columns.forEach((column) => {
			if (column.columns) {
				const colSpan = column.columns.length
				groupedHeaders.push({ header: column.header, colSpan })
			} else {
				groupedHeaders.push({ header: '', colSpan: 1 })
			}
		})
		const groupedHeadersRow = groupedHeaders.flatMap((group) => Array(group.colSpan).fill(group.header))
		const headers = flattenedColumns.map((col) => col.header)
		const dataFormat = data.map((row) => {
			return flattenedColumns.map((col) => {
				const value = row[col.accessorKey]
				return value instanceof Date
					? `${value.toLocaleDateString()} ${value.toLocaleTimeString()}`
					: value ?? ''
			})
		})
		const dataWithHeaders = [groupedHeadersRow, headers, ...dataFormat]
		const csv = generateCsv(csvConfig)(dataWithHeaders)
		download(csvConfig)(csv)
	}

	// Exportado de pdf
	const handleExportRowsPdf = (rows) => {
		const doc = new jsPDF()
		const tableData = rows
			.map((row) => Object.values(row.original))
			.map((row) => {
				const linea = row.map((item) => {
					if (item instanceof Date) {
						item = `${item.toLocaleDateString()} ${item.toLocaleTimeString()}`
					}
					return item
				})
				return linea
			})

		const tableHeaders = columns.map((c) => c.header)

		autoTable(doc, {
			head: [tableHeaders],
			body: tableData,
		})

		doc.save('pdf-export.pdf')
	}
	const filtros =
		storage.get('filter')?.reduce((acc, item) => {
			if (columns?.some((col) => col.accessorKey === item.name)) {
				acc = { id: item.name, value: item.value }
			}
			return acc
		}, {}) || {}
	// creo una constante con las configuracion inicial para poder modificar con props
	const tableInitialState = {
		density: prop.density ? prop.density : window.innerWidth < 750 ? 'compact' : 'comfortable',
		expanded: true,
		showColumnFilters: false,
		columnFilters: Object.keys(filtros).length ? [filtros] : [],
		columnVisibility: prop.columnVisibility,
		sorting: [],
		grouping: [],
	}
	// activacion de paginacion
	if (prop.pagination) {
		tableInitialState.pagination = { pageIndex: 0, pageSize: prop.pageSize || 5 }
	}
	// controlo si llega un agrupacion por columna
	if (prop.groupBy) {
		tableInitialState.grouping.push(prop.groupBy)
	}
	// controlo si llega un orden por columna
	if (prop.orderBy) {
		tableInitialState.sorting.push({ id: prop.orderBy, desc: false })
	}
	const hideColumn = prop?.onColumnVisibilityChange ? { onColumnVisibilityChange: prop.onColumnVisibilityChange } : ''
	const columnVisibility = prop?.columnVisibility ? { columnVisibility: prop.columnVisibility } : ''
	const pags = () => {
		prop.getPage(table)
	}
	const localization = {
		hideAll: 'Ocultar todo',
		showAll: 'Mostrar todo',
		// Puedes personalizar otros textos aquí si es necesario
	}

	const table = useMaterialReactTable({
		columns,
		data,
		localization,
		initialState: tableInitialState,
		state: {
			...columnVisibility,
		},
		groupedColumnMode: 'remove',
		positionToolbarAlertBanner: 'none',
		positionToolbarDropZone: 'none',
		enableTopToolbar: prop.topToolbar || false,
		enableStickyFooter: false,
		enableStickyHeader: true,
		enablePagination: prop.pagination ?? false,
		defaultColumn: {
			minSize: 10,
		},
		displayColumnDefOptions: {
			'mrt-row-expand': {
				size: 5,
				minSize: 1,
				maxSize: 10,
				Cell: ({ row, table }) => {
					if (!row.depth) {
						return <MRT_ExpandButton row={row} table={table} />
					}
				},
			},
		},
		muiTableContainerProps: { sx: { maxHeight: prop.pagination ? 'auto' : 50000 } },
		// HABILITACION DE ROWS
		enableBatchRowSelection: prop.checkbox ?? false,
		enableMultiRowSelection: prop.checkbox ?? false,
		enableRowSelection: prop.checkbox ?? false,
		enableSelectAll: prop.checkbox ?? false,
		enableSubRowSelection: prop.checkbox ?? false,
		// HABILITACION DE COLUMNA
		enableFullScreenToggle: prop.fullScreen || false,
		// si esta true te deja copiar el campo de la tabla
		enableClickToCopy: prop.copy,
		// habilita los 3 puntos para acciones por columna
		enableColumnActions: false,
		// habilita hacer drag and drop aunque faltan otras opciones para que funcione al 100%
		enableColumnDragging: false,
		// habilita el poder filtrar por todas las columnas
		enableColumnFilters: prop.filter || false,
		// activa un boton que te genera un modal para editar el campo en la tabla, pero hay que combinarlo con otra funcion para el guardado, actualizacion, etc.
		enableEditing: false,
		// permite agrupar por columnas
		enableGrouping: prop.grouping,
		// junto con el de los 3 puntos de accion te permite ocultar columnas, o activando el toopbar
		enableHiding: prop.hide,
		// habilita el ordenamiento de columnas osea ordenar los datos por alguna columna en especifico
		enableSorting: prop.sort,

		// svg para cuando la tabla esta vacia
		renderEmptyRowsFallback: () => {
			return <NoRegisterTable />
		},

		// clases para el header de la tabla (muiTableHeadRowProps, muiTableHeadCellProps, muiTableHeadProps)
		muiTableHeadRowProps: {
			sx: {
				backgroundColor: 'white',
				boxShadow: 'none',
				border: 'none',
			},
		},

		muiTableHeadCellProps: (cell) => {
			return {
				sx: {
					backgroundColor: 'white',
					...prop.header,
				},
			}
		},

		// ------------------------------------

		// clases para la linea de herramientas de arriba ()
		muiTopToolbarProps: {
			sx: {
				backgroundColor: 'white',
			},
		},
		// Se creo a mano las herramientas para poder escribir en español las opciones
		renderTopToolbar: ({ table }) => (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'center',
					backgroundColor: 'white',
					...prop.toolbarClass,
				}}
			>
				{prop.btnCustomToolbar && prop.btnCustomToolbar}
				{prop.exportExcel && (
					<IconButton
						onClick={() => handleExportData()}
						table={table}
						title='Exportar a excel'
						sx={{
							color: 'green',
						}}
					>
						<SiMicrosoftexcel />
					</IconButton>
				)}

				{prop.exportPdf && (
					<IconButton
						// si se descomenta este y se comenta el otro onclick se puede hacer que sea por linea la descarga, pero no tengo tiempo para hacerlo ahora
						// onClick={() => handleExportRows(table.getRowModel().rows)}
						onClick={() => handleExportRowsPdf(table.getPrePaginationRowModel().rows)}
						table={table}
						title='Exportar a PDF'
						sx={{
							color: 'red',
						}}
					>
						<FaFilePdf />
					</IconButton>
				)}
				<MRT_GlobalFilterTextField placeholder='Escriba su busqueda' table={table} />
				{prop.getPage && prop.checkAlert && (
					<IconButton
						onClick={() => pags()}
						table={table}
						title='Limpiar alertas'
						sx={{
							'&:hover': {
								backgroundColor: '#ecec97',
							},
							background: 'yellow',
							color: 'black',
						}}
					>
						<PiBroomFill />
					</IconButton>
				)}
				<MRT_ToggleGlobalFilterButton title='Buscar' table={table} />
				{prop.filter && <MRT_ToggleFiltersButton title='Filtrar' table={table} />}

				{prop.hide && <MRT_ShowHideColumnsButton title='Mostras/Ocultar Columnas' table={table} />}
				{prop.density && <MRT_ToggleDensePaddingButton title='Densidad' table={table} />}

				{/* descomentar si queremos hacer un fullScreen en la tabla */}
				{/* <MRT_ToggleFullScreenButton table={table} /> */}

				{/* descomentar si queremos hacer un boton de impresion en la tabla */}
				{/* <Tooltip title='Print'>
					<IconButton onClick={() => window.print()}>
						<Print />
					</IconButton>
				</Tooltip> */}
			</Box>
		),
		// ------------------------------------

		// clases para la linea de herramientas de abajo

		muiBottomToolbarProps: {
			sx: {
				minHeight: prop.pagination ? '3.5rem' : '2rem',
				backgroundColor: 'transparent',
				color: 'black !important',
				...prop.footer,
			},
		},

		// ------------------------------------

		// clases para el fondo y bordes de la tabla

		muiTablePaperProps: {
			sx: {
				backgroundColor: 'white',
				...prop.card,
			},
		},

		// ------------------------------------

		// clases para la paginacion

		muiPaginationProps: {
			showRowsPerPage: true,
			// El texto de las filas por paginas esta al final en el useEfect
		},
		paginationDisplayMode: 'pages',

		// ------------------------------------
		// clases para el body de la tabla(muiTableBodyCellProps, muiTableBodyProps, muiTableBodyRowProps)
		muiTableBodyCellProps: ({ row }) => ({
			sx: {
				backgroundColor:
					prop.ChangeColorRow && prop.ChangeColorRow(row)
						? 'yellow !important'
						: undefined,
				color:
					prop.ChangeColorRow && prop.ChangeColorRow(row)
						? 'black'
						: undefined,
				...prop.bodyContent,
			},
		}),
		
		muiTableBodyProps: {
			sx: () => ({
				'& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: '#f9fafb',
				},
				'& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
					backgroundColor: '#e2e8f0',
				},
				'& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: '#f1f5f9',
				},
				'& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
					backgroundColor: '#e2e8f0',
				},
			}),
		},
		// ------------------------------------

		// funcion para guardar las columnas que se ocultan

		...hideColumn,
	})
	useEffect(() => {
		const label = document.querySelector('label[for="mrt-rows-per-page"]')
		if (label) {
			label.innerText = 'Filas por página'
		}
	}, [])
	return <MaterialReactTable table={table} />
}

export default TableCustom
