import { Tab, Tabs, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useContext, useEffect, useState } from 'react'
import { CustomTabPanel, a11yProps } from '../components/PanelTab'
import { useNavigate } from 'react-router-dom'
import { MainContext } from '../../../context/MainContext'

function TabDinamic({ ...props }) {
	const navigate = useNavigate()
	const { tabs, setTabs, tabCurrent, setTabCurrent, setTabActive } = useContext(MainContext)
	const [value, setValue] = useState(tabCurrent)
	const handleChange = (event, newValue) => {
		setValue(newValue)
		setTabCurrent(newValue)
	}

	const handleRemoveTab = (indexToRemove) => {
		setTabs(tabs.filter((_, index) => index !== indexToRemove))
		if (value >= indexToRemove && value > 0) {
			setTabCurrent(value - 1)
			setValue(value - 1)
		}
	}

	const classTabs =
		'!border-solid !border-gray-200 !rounded-t-xl !text-base !text-black !font-bold dark:!text-zinc-200 dark:!border-gray-700'
	const classTabStatus = [
		['!bg-white !border-r-2 !border-t-2 !border-l-2 dark:!bg-zinc-500 '],
		['!border-b-2 !bg-gray-300 dark:!bg-zinc-700 hover:dark:!bg-zinc-500 hover:!bg-zinc-400 '],
	]
	useEffect(() => {
		if (tabs.length == 0) {
			navigate('/Home')
		}
		if (tabs.length > 0 && props.pag === true) {
			setTabActive(tabs.length)
		}
	}, [tabs])
	return (
		<div className={`w-full max-w-[94.5vw] !mr-3 !rounded-xl flex flex-col items-center`}>
			<Tabs
				className='flex w-full '
				indicatorColor='transparent'
				value={value}
				onChange={handleChange}
				aria-label='basic tabs example'
			>
				{tabs.map((item, index) => {
					return (
						<Tab
							key={index}
							className={`flex-grow  relative !max-w-80 ${
								classTabStatus[value === index ? 0 : 1]
							} ${classTabs}`}
							label={
								<div className='pl-2 flex items-center justify-between w-full'>
									<span
										className={`${!item.name ? ' !italic font-light lowercase text-gray-400' : ''}`}
									>
										{item.name || '(Sin Matricula)'}
									</span>
									<a onClick={() => handleRemoveTab(index)} className=''>
										<CloseIcon fontSize='small' />
									</a>
								</div>
							}
							{...a11yProps(index)}
						/>
					)
				})}
			</Tabs>
			<div
				className={`bg-white dark:!bg-zinc-500 w-full h-full flex-col justify-center items-center border-2 border-t-0 !p-4 rounded-b-2xl rounded-se-2xl border-zinc-200 dark:!border-gray-700`}
			>
				{tabs.map((item, index) => {
					return (
						<CustomTabPanel
							key={index}
							className={'w-full flex max-sm:flex-col flex-wrap justify-evenly'}
							value={value}
							index={index}
						>
							{item.component}
						</CustomTabPanel>
					)
				})}
			</div>
		</div>
	)
}

export default TabDinamic
