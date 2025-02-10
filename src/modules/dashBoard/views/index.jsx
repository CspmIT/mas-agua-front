// import { listen } from '@tauri-apps/api/event'
// import GridLayout from 'react-grid-layout'
// import '../../../../node_modules/react-grid-layout/css/styles.css'
// import '../../../../node_modules/react-resizable/css/styles.css'
// import { Suspense, lazy, useEffect, useState } from 'react'
// import LoaderComponent from '../../../components/Loader'
// import '../utils/styles.css'
// import { Check, Edit } from '@mui/icons-material'
// import { IconButton } from '@mui/material'

// function DashBoard() {
// 	const [graficos, setGraficos] = useState([])
// 	const [widthGraf, setWidthGraf] = useState(window.innerWidth * 0.9)
// 	const [numCol, setNumCol] = useState(window.innerWidth > 800 ? 40 : 12)
// 	const [rowHeight, setRowHeight] = useState(20)
// 	const [sizeCelu, setSizeCelu] = useState(window.innerWidth < 800 ? true : false)
// 	const [dashboardStatic, setDashboardStatic] = useState(false)
// 	const [availableHandles, setAvailableHandles] = useState([])
// 	const [layoutCustom, setLayoutCustom] = useState([
// 		{ i: 'GrafArea', x: 0, y: 0, w: sizeCelu ? 8 : 5, h: 5, minW: sizeCelu ? 8 : 5, minH: 5 },
// 		{ i: 'GraficodePrueba', x: 8, y: 0, w: sizeCelu ? 8 : 5, h: 5, minW: sizeCelu ? 8 : 5, minH: 5 },
// 		{ i: 'GrafBarra', x: 16, y: 0, w: sizeCelu ? 8 : 5, h: 5, minW: sizeCelu ? 8 : 5, minH: 5 },
// 		{ i: 'Gauges', x: 24, y: 0, w: sizeCelu ? 8 : 7, h: 7, minW: sizeCelu ? 8 : 7, minH: 7 },
// 		{ i: 'TableDashboar', x: 0, y: 5, w: sizeCelu ? 8 : 5, h: 12, minW: sizeCelu ? 8 : 5, minH: 11 },
// 		{ i: 'MapPrueba', x: 40, y: 5, w: sizeCelu ? 8 : 5, h: 9, minW: sizeCelu ? 8 : 9, minH: 9 },
// 	])

// 	useEffect(() => {
// 		setTimeout(() => {
// 			if (graficos.length === 0) {
// 				const componentes = componentMap.map((item) => {
// 					return { componente: [lazy(item.link)], id: item.name }
// 				})
// 				setGraficos(componentes)
// 			}
// 		}, 1500)
// 	}, [componentMap])
// 	useEffect(() => {
// 		if (window.__TAURI__) {
// 			listen('tauri://resize', (event) => {
// 				const { width } = event.payload
// 				setWidthGraf(width - 100)
// 				setSizeCelu(false)
// 				const newNumCol = parseInt((width - 150) / 30)
// 				setNumCol(newNumCol)
// 				const newLayout = layoutCustom.map((item) => {
// 					return {
// 						...item,
// 						w: Math.max(item.w + 2, 1),
// 					}
// 				})
// 				const oldLayout = layoutCustom.map((item) => {
// 					return {
// 						...item,
// 					}
// 				})
// 				setLayoutCustom(newLayout)
// 				setTimeout(() => {
// 					setLayoutCustom(oldLayout)
// 				}, 200)
// 			})
// 		}
// 	}, [])
// 	const updateSize = () => {
// 		if (!window.__TAURI__) {
// 			const windowWidth = window.innerWidth
// 			const newWidth = windowWidth * 0.9
// 			setWidthGraf(newWidth)
// 			if (windowWidth > 800) {
// 				setSizeCelu(false)
// 				if (windowWidth < 1050) {
// 					setNumCol(30)
// 				} else {
// 					setNumCol(40)
// 				}
// 			} else {
// 				setSizeCelu(true)
// 				setNumCol(12)
// 			}
// 			const updatedLayout = layoutCustom.map((item) => ({
// 				...item,
// 				x: controlUbicacio(item.x, item.w),
// 				w: item.w > 12 && windowWidth < 800 ? 11 : item.w,
// 			}))
// 			setLayoutCustom(updatedLayout)
// 		}
// 	}

// 	useEffect(() => {
// 		updateSize()
// 		window.addEventListener('resize', updateSize)

// 		return () => {
// 			window.removeEventListener('resize', updateSize)
// 		}
// 	}, [])

// 	const controlUbicacio = (x, w) => {
// 		const windowWidth = window.innerWidth
// 		if (windowWidth < 800 && x + w > 12) {
// 			return 0
// 		} else if (windowWidth < 1050 && x + w >= 40) {
// 			return 0
// 		} else if (x + w >= 40) {
// 			return 0
// 		} else {
// 			return x
// 		}
// 	}

// 	const editDashboard = () => {
// 		setDashboardStatic(!dashboardStatic)
// 		if (!dashboardStatic) {
// 			setAvailableHandles(['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'])
// 		} else {
// 			setAvailableHandles([])
// 		}
// 	}
// 	const handleLayoutChange = (data) => {
// 		setLayoutCustom(data)
// 	}

// 	return (
// 		<>
// 			{graficos.length > 0 ? (
// 				<>
// 					<IconButton
// 						className={`!absolute !top-5 !right-5 !p-3 !rounded-full !shadow-gray-400 shadow-md z-50 ${
// 							dashboardStatic ? '!bg-green-500' : '!bg-gray-300'
// 						}`}
// 						onClick={() => editDashboard()}
// 					>
// 						{dashboardStatic ? (
// 							<Check className='text-white font-bold ' />
// 						) : (
// 							<Edit className='text-blue-500' />
// 						)}
// 					</IconButton>
// 					<GridLayout
// 						onResizeStop={(data) => handleLayoutChange(data)}
// 						isDraggable={dashboardStatic}
// 						isResizable={dashboardStatic}
// 						resizeHandles={availableHandles}
// 						className='layout'
// 						hei
// 						layout={layoutCustom}
// 						cols={numCol}
// 						rowHeight={rowHeight}
// 						width={widthGraf}
// 					>
// 						{graficos.map((item) => {
// 							const Component = item.componente[0]
// 							return (
// 								<div
// 									className={
// 										'chartContainer  bg-white dark:bg-gray-300 rounded-lg shadow-gray-500 shadow-md drop-shadow-md p-3'
// 									}
// 									key={item.id}
// 								>
// 									<Suspense fallback={<div>Cargando...</div>}>
// 										<Component />
// 									</Suspense>
// 								</div>
// 							)
// 						})}
// 					</GridLayout>
// 				</>
// 			) : (
// 				<div className='justify-center items-center flex w-full'>
// 					<LoaderComponent />
// 				</div>
// 			)}
// 		</>
// 	)
// }

// export default DashBoard
