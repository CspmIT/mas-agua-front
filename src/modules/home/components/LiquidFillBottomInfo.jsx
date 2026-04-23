import { useState } from 'react'
import { ButtonBase } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import GaugeSpeed from '../../Charts/components/GaugeSpeed'

const formatValue = value => {
	if (value === null || value === undefined || value === '') return null
	const num = Number(value)
	return isNaN(num) ? value : num.toFixed(2)
}

const BottomItem = ({ item }) => {
	if (!item?.value && item?.value !== 0) return null

	const label = item.label ?? ''
	const unit = item.unit ?? ''
	const value = formatValue(item.value)

	if (value === null) return null

	return (
		<div className='text-center leading-tight'>
			{label && (
				<span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-gray-400 mr-1.5'>
					{label}
				</span>
			)}
			<span className='tabular-nums text-sm font-semibold text-slate-800 dark:text-gray-100'>
				{value}
				{unit && (
					<span className='ml-0.5 text-[10px] font-medium text-slate-500 dark:text-gray-400'>
						{unit}
					</span>
				)}
			</span>
		</div>
	)
}

const ChevronButton = ({ direction, onClick, disabled }) => {
	const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			aria-label={direction === 'left' ? 'Página anterior' : 'Página siguiente'}
			className='group flex h-1 w-1 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-gray-500 transition-colors hover:text-[#368bed] dark:hover:text-[#5ea5f0] hover:bg-[#368bed]/10 dark:hover:bg-[#368bed]/15 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:dark:hover:text-gray-500 disabled:cursor-not-allowed'
		>
			<Icon sx={{ fontSize: 11 }} />
		</button>
	)
}

const LiquidFillBottomInfo = ({ items = [], chart }) => {
	const [page, setPage] = useState(0)
	const isGauge = chart === GaugeSpeed
	const ITEMS_PER_PAGE = isGauge ? 1 : 2

	const validItems = items.filter(item => item && (item.value || item.value === 0))

	if (validItems.length === 0) return null

	const totalPages = Math.ceil(validItems.length / ITEMS_PER_PAGE)
	const hasMultiplePages = totalPages > 1
	const currentItems = validItems.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)

	return (
		<div className='flex flex-col items-center mb-1 w-full rounded-xl border border-slate-200/80 dark:border-gray-700/60 bg-gradient-to-b from-slate-50/60 to-slate-50/20 dark:from-gray-800/40 dark:to-gray-800/10 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'>
			<div className='flex items-center w-full px-1 py-1'>
				{hasMultiplePages ? (
					<ChevronButton direction='left' onClick={() => setPage(p => p - 1)} disabled={page === 0} />
				) : (
					<div className='w-1 shrink-0' />
				)}

				<div className='flex-1 flex flex-col items-center justify-center'>
					{currentItems.map((item, i) => (
						<BottomItem key={page * ITEMS_PER_PAGE + i} item={item} />
					))}
				</div>

				{hasMultiplePages ? (
					<ChevronButton direction='right' onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} />
				) : (
					<div className='w-1 shrink-0' />
				)}
			</div>

			{hasMultiplePages && (
				<div className='flex gap-1 pb-1'>
					{Array.from({ length: totalPages }).map((_, i) => (
						<ButtonBase
							key={i}
							onClick={() => setPage(i)}
							aria-label={`Ir a la página ${i + 1}`}
							sx={{
								height: 3,
								width: i === page ? 14 : 5,
								borderRadius: 99,
								bgcolor: i === page ? '#368bed' : 'rgb(203 213 225)',
								'.dark &': {
									bgcolor: i === page ? '#5ea5f0' : 'rgb(75 85 99)',
								},
								transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s',
								minWidth: 0,
								p: 0,
								'&:hover': {
									bgcolor: i === page ? '#368bed' : 'rgb(148 163 184)',
								},
							}}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default LiquidFillBottomInfo
