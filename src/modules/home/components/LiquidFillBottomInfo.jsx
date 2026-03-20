import { useState } from 'react'
import { Button, ButtonBase, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const ITEMS_PER_PAGE = 2

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
        <Typography variant="subtitle1" className="text-center leading-tight">
            {label && <span className="font-medium">{label} </span>}
            <span className="font-bold text-lg">{value} {unit}</span>
        </Typography>
    )
}

const LiquidFillBottomInfo = ({ items = [] }) => {
    const [page, setPage] = useState(0)

    const validItems = items.filter(item => item && (item.value || item.value === 0))

    if (validItems.length === 0) return null

    const totalPages = Math.ceil(validItems.length / ITEMS_PER_PAGE)
    const hasMultiplePages = totalPages > 1
    const currentItems = validItems.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)

    return (
        <div className="flex flex-col items-center mb-1 rounded-xl bg-slate-50/30 border-2 border-blue-200 w-full">
            <div className="flex items-center w-full">

                {hasMultiplePages ? (
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 0}
                        className="p-0 w-4 flex items-center justify-center text-blue-300 disabled:opacity-20 hover:text-blue-500 transition-colors shrink-0"
                    >
                        <ChevronLeftIcon sx={{ fontSize: 14 }} />
                    </button>
                ) : (
                    <div className="w-4 shrink-0" />
                )}

                <div className="flex-1 flex flex-col items-center justify-center">
                    {currentItems.map((item, i) => (
                        <BottomItem key={page * ITEMS_PER_PAGE + i} item={item} />
                    ))}
                </div>

                {hasMultiplePages ? (
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === totalPages - 1}
                        className="p-0 w-4 flex items-center justify-center text-blue-300 disabled:opacity-20 hover:text-blue-500 transition-colors shrink-0"
                    >
                        <ChevronRightIcon sx={{ fontSize: 14 }} />
                    </button>
                ) : (
                    <div className="w-4 shrink-0" />
                )}

            </div>

            {hasMultiplePages && (
                <div className="flex gap-0.5 pb-0.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <ButtonBase
                            key={i}
                            onClick={() => setPage(i)}
                            sx={{
                                height: 3,
                                width: i === page ? 12 : 6,
                                borderRadius: 99,
                                bgcolor: i === page ? 'primary.light' : '#bfdbfe',
                                transition: 'all 0.2s',
                                minWidth: 0,
                                p: 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default LiquidFillBottomInfo