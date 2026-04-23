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

const toolbarIconSx = (baseColor, hoverBg, darkHoverBg) => ({
	color: baseColor,
	borderRadius: '10px',
	transition: 'background-color 0.15s ease, transform 0.15s ease',
	'&:hover': {
		backgroundColor: hoverBg,
		transform: 'translateY(-1px)',
	},
	'body.dark &:hover': {
		backgroundColor: darkHoverBg,
	},
})

const TableCustom = ({ data, columns, ...prop }) => {
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
	const tableInitialState = {
		density: prop.density ? prop.density : window.innerWidth < 750 ? 'compact' : 'comfortable',
		expanded: true,
		showColumnFilters: false,
		columnFilters: Object.keys(filtros).length ? [filtros] : [],
		columnVisibility: prop.columnVisibility,
		sorting: [],
		grouping: [],
	}
	if (prop.pagination) {
		tableInitialState.pagination = { pageIndex: 0, pageSize: prop.pageSize || 5 }
	}
	if (prop.groupBy) {
		tableInitialState.grouping.push(prop.groupBy)
	}
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
		muiTableContainerProps: {
			sx: {
				maxHeight: prop.pagination ? 'auto' : 50000,
				backgroundColor: 'transparent',
				'body.dark &': { backgroundColor: 'transparent' },
			},
		},
		enableBatchRowSelection: prop.checkbox ?? false,
		enableMultiRowSelection: prop.checkbox ?? false,
		enableRowSelection: prop.checkbox ?? false,
		enableSelectAll: prop.checkbox ?? false,
		enableSubRowSelection: prop.checkbox ?? false,
		enableFullScreenToggle: prop.fullScreen || false,
		enableClickToCopy: prop.copy,
		enableColumnActions: false,
		enableColumnDragging: false,
		enableColumnFilters: prop.filter || false,
		enableEditing: false,
		enableGrouping: prop.grouping,
		enableHiding: prop.hide,
		enableSorting: prop.sort,

		renderEmptyRowsFallback: () => {
			return <NoRegisterTable />
		},

		muiTableHeadRowProps: {
			sx: {
				backgroundColor: '#2c6aa0',
				boxShadow: 'none',
				borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
				'body.dark &': {
					backgroundColor: '#1f4e79',
					borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
				},
			},
		},

		muiTableHeadCellProps: () => ({
			sx: {
				backgroundColor: 'transparent',
				color: '#ffffff',
				fontSize: '0.72rem',
				fontWeight: 700,
				letterSpacing: '0.06em',
				textTransform: 'uppercase',
				borderBottom: 'none',
				'& .Mui-TableHeadCell-Content': { justifyContent: 'flex-start' },
				'& .MuiButtonBase-root, & .MuiSvgIcon-root, & .MuiTableSortLabel-icon': {
					color: '#ffffff !important',
				},
				'body.dark &': { color: '#ffffff' },
				...prop.header,
			},
		}),

		muiTopToolbarProps: {
			sx: {
				backgroundColor: '#ffffff',
				borderBottom: '1px solid rgba(15, 42, 68, 0.06)',
				'body.dark &': {
					backgroundColor: 'rgba(17, 24, 39, 0.6)',
					borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
				},
			},
		},
		renderTopToolbar: ({ table }) => (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'center',
					gap: 0.5,
					px: 1,
					py: 0.75,
					backgroundColor: 'transparent',
					'& .MuiFormControl-root input': {
						fontSize: '0.875rem',
					},
					...prop.toolbarClass,
				}}
			>
				{prop.btnCustomToolbar && prop.btnCustomToolbar}
				{prop.exportExcel && (
					<Tooltip title='Exportar a Excel'>
						<IconButton
							onClick={() => handleExportData()}
							table={table}
							sx={toolbarIconSx('#059669', 'rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.18)')}
						>
							<SiMicrosoftexcel />
						</IconButton>
					</Tooltip>
				)}

				{prop.exportPdf && (
					<Tooltip title='Exportar a PDF'>
						<IconButton
							onClick={() => handleExportRowsPdf(table.getPrePaginationRowModel().rows)}
							table={table}
							sx={toolbarIconSx('#e11d48', 'rgba(244, 63, 94, 0.12)', 'rgba(244, 63, 94, 0.18)')}
						>
							<FaFilePdf />
						</IconButton>
					</Tooltip>
				)}
				<MRT_GlobalFilterTextField placeholder='Escriba su busqueda' table={table} />
				{prop.getPage && prop.checkAlert && (
					<Tooltip title='Limpiar alertas'>
						<IconButton
							onClick={() => pags()}
							table={table}
							sx={toolbarIconSx('#b45309', 'rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.22)')}
						>
							<PiBroomFill />
						</IconButton>
					</Tooltip>
				)}
				<MRT_ToggleGlobalFilterButton title='Buscar' table={table} />
				{prop.filter && <MRT_ToggleFiltersButton title='Filtrar' table={table} />}

				{prop.hide && <MRT_ShowHideColumnsButton title='Mostras/Ocultar Columnas' table={table} />}
				{prop.density && <MRT_ToggleDensePaddingButton title='Densidad' table={table} />}
			</Box>
		),

		muiBottomToolbarProps: {
			sx: {
				minHeight: prop.pagination ? '3.5rem' : '2rem',
				backgroundColor: '#eef2f7',
				color: '#1f2937 !important',
				borderTop: '1px solid rgba(15, 42, 68, 0.1)',
				boxShadow: 'none',
				'body.dark &': {
					backgroundColor: 'rgba(30, 41, 59, 0.75)',
					color: '#e5e7eb !important',
					borderTop: '1px solid rgba(255, 255, 255, 0.06)',
				},
				'& .MuiTablePagination-root, & .MuiTablePagination-toolbar, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiSelect-icon, & .MuiIconButton-root':
					{
						color: 'inherit',
					},
				...prop.footer,
			},
		},

		muiTablePaperProps: {
			elevation: 0,
			sx: {
				backgroundColor: '#ffffff',
				borderRadius: '14px',
				border: '1px solid rgba(15, 42, 68, 0.08)',
				boxShadow: '0 2px 6px rgba(15, 42, 68, 0.05), 0 12px 32px -12px rgba(15, 42, 68, 0.14)',
				overflow: 'hidden',
				transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				opacity: 0,
				transform: 'translateY(8px)',
				animation: 'tableMountIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
				'@keyframes tableMountIn': {
					'0%': { opacity: 0, transform: 'translateY(8px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
				'&:hover': {
					boxShadow: '0 4px 10px rgba(15, 42, 68, 0.06), 0 18px 40px -14px rgba(15, 42, 68, 0.18)',
				},
				'body.dark &': {
					backgroundColor: 'rgba(17, 24, 39, 0.85)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
					boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 12px 32px -12px rgba(0, 0, 0, 0.5)',
				},
				'body.dark &:hover': {
					boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3), 0 18px 40px -14px rgba(0, 0, 0, 0.55)',
				},
				...prop.card,
			},
		},

		muiPaginationProps: {
			showRowsPerPage: true,
			shape: 'rounded',
			sx: {
				'& .MuiPaginationItem-root': {
					borderRadius: '8px',
					fontWeight: 500,
					color: '#1f2937',
					'&:hover': { backgroundColor: 'rgba(44, 106, 160, 0.1)' },
				},
				'& .MuiPaginationItem-root.Mui-selected': {
					backgroundColor: '#2c6aa0',
					color: '#ffffff',
					fontWeight: 600,
					'&:hover': { backgroundColor: '#1f4e79' },
				},
				'body.dark & .MuiPaginationItem-root': {
					color: '#e5e7eb',
					'&:hover': { backgroundColor: 'rgba(94, 165, 240, 0.15)' },
				},
				'body.dark & .MuiPaginationItem-root.Mui-selected': {
					backgroundColor: '#5ea5f0',
					color: '#0f172a',
					'&:hover': { backgroundColor: '#3b82f6' },
				},
			},
		},
		paginationDisplayMode: 'pages',

		muiTableBodyCellProps: ({ row }) => {
			const isHighlighted = prop.ChangeColorRow && prop.ChangeColorRow(row)
			return {
				sx: {
					borderBottom: '1px solid rgba(15, 42, 68, 0.04)',
					color: isHighlighted ? '#7c2d12' : '#1f2937',
					fontSize: '0.875rem',
					backgroundColor: isHighlighted ? 'rgba(245, 158, 11, 0.14) !important' : undefined,
					'body.dark &': {
						borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
						color: isHighlighted ? '#fbbf24' : '#e5e7eb',
						backgroundColor: isHighlighted ? 'rgba(245, 158, 11, 0.18) !important' : undefined,
					},
					...prop.bodyContent,
				},
			}
		},

		muiTableBodyProps: {
			sx: () => ({
				'& tr > td': {
					transition: 'background-color 0.18s ease',
				},
				'& tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: '#ffffff',
				},
				'& tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: '#f8fafc',
				},
				'& tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
					backgroundColor: 'rgba(54, 139, 237, 0.08) !important',
				},
				'& tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td:first-of-type': {
					boxShadow: 'inset 3px 0 0 #2c6aa0',
				},
				'body.dark & tr:nth-of-type(odd):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: 'rgba(17, 24, 39, 0.6)',
				},
				'body.dark & tr:nth-of-type(even):not([data-selected="true"]):not([data-pinned="true"]) > td': {
					backgroundColor: 'rgba(31, 41, 55, 0.5)',
				},
				'body.dark & tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td': {
					backgroundColor: 'rgba(94, 165, 240, 0.1) !important',
				},
				'body.dark & tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td:first-of-type': {
					boxShadow: 'inset 3px 0 0 #5ea5f0',
				},
			}),
		},

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
