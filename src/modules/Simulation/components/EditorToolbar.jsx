import { Tooltip } from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { NODE_TOOLS, LINK_TOOLS } from '../lib/editorDefaults'
import { ElementIcon } from './elementIcons'

const TOOLS = [
	{ tool: 'select', label: 'Seleccionar', icon: <NearMeIcon sx={{ fontSize: 18 }} /> },
	...NODE_TOOLS.map((t) => ({ tool: t.tool, label: t.label, icon: <ElementIcon kind='node' type={t.tool} color={t.color} /> })),
	...LINK_TOOLS.map((t) => ({
		tool: t.tool,
		label: `${t.label} (unir dos nodos)`,
		icon: <ElementIcon kind='link' type={t.tool} color={t.color} />,
	})),
	{ tool: 'delete', label: 'Eliminar elemento', icon: <DeleteOutlineIcon sx={{ fontSize: 18 }} /> },
]

const EditorToolbar = ({ tool, onToolChange, disabled }) => (
	<div className='absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-600 shadow-lg p-1.5'>
		{TOOLS.map((t) => (
			<Tooltip key={t.tool} title={t.label} placement='right'>
				<button
					type='button'
					disabled={disabled}
					onClick={() => onToolChange(t.tool)}
					className={`border-0 p-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 ${
						tool === t.tool
							? 'bg-[#368bed]/15 ring-1 ring-[#368bed]'
							: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
					}`}
				>
					<span className='text-slate-600 dark:text-gray-300 flex'>{t.icon}</span>
				</button>
			</Tooltip>
		))}
	</div>
)

export default EditorToolbar
