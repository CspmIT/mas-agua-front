import { Accordion, AccordionSummary, AccordionDetails, Checkbox, Typography, List, ListItem } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import BtnActions from '../../AddMenu/components/BtnActions'
import { useEffect, useState } from 'react'

function MenuItems({
	items,
	expandedAccordions,
	handleAccordionChange,
	selectedMenus,
	handleCheckboxChange,
	calculateCheckboxState = false,
	newSubMenu = false,
	deleteSubMenu = false,
	editSubMenu = false,
	permissonUserData = false,
	permissonProfileData = false,
}) {
	return items.map((item) => {
		const number = 240 - parseInt(item.level) * 20
		const isExpanded = expandedAccordions[item.id] || false

		// Estado local
		const [check, setChecked] = useState(false)
		const [indeter, setIndeterminate] = useState(false)

		// Actualizar estado basado en calculateCheckboxState
		useEffect(() => {
			if (calculateCheckboxState) {
				const { checked, indeterminate } = calculateCheckboxState(item)
				setChecked(checked)
				setIndeterminate(indeterminate)
			}
		}, [calculateCheckboxState, item])
		return (
			<div key={item.id} className='!w-full'>
				{item.subMenus.length ? (
					<Accordion
						expanded={isExpanded}
						onChange={handleAccordionChange(item.id)}
						key={item.id}
						sx={{ backgroundColor: isExpanded ? `rgb(${number},${number},${number})` : 'transparent' }}
						className={`!w-full !shadow-none `}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon className='text-black' />}
							aria-controls={`panel${item.id}-content`}
							sx={{ flexDirection: 'row-reverse', textAlign: 'center' }}
							id={`panel${item.id}-header`}
						>
							{calculateCheckboxState && (
								<Checkbox
									checked={check}
									indeterminate={indeter}
									disabled={permissonProfileData.some(
										(perm) =>
											Boolean(perm.id_profile) && Boolean(perm.status) && perm.id_menu == item.id
									)}
									onClick={(event) => {
										event.stopPropagation()
										let type_select = permissonProfileData.length ? 'user_id' : 'profile'
										handleCheckboxChange(item.id, item.subMenus, type_select)
									}}
								/>
							)}
							<Typography className='flex items-center'>{item.name}</Typography>
							{newSubMenu ? (
								<BtnActions
									data={item}
									optCreate={newSubMenu}
									optEdit={editSubMenu}
									optDelete={deleteSubMenu}
								/>
							) : null}
						</AccordionSummary>

						{item.subMenus && (
							<AccordionDetails
								className={`flex flex-col !items-start !pl-14 ${
									isExpanded ? 'border-solid border-0 border-t-2 border-white' : ''
								}`}
								key={item.id}
							>
								<List className='w-full'>
									{calculateCheckboxState && (
										<MenuItems
											items={item.subMenus}
											expandedAccordions={expandedAccordions}
											handleAccordionChange={handleAccordionChange}
											selectedMenus={selectedMenus}
											handleCheckboxChange={handleCheckboxChange}
											calculateCheckboxState={calculateCheckboxState}
											permissonProfileData={permissonProfileData}
											permissonUserData={permissonUserData}
										/>
									)}
									{newSubMenu && (
										<MenuItems
											items={item.subMenus}
											expandedAccordions={expandedAccordions}
											handleAccordionChange={handleAccordionChange}
											newSubMenu={newSubMenu}
											deleteSubMenu={deleteSubMenu}
										/>
									)}
								</List>
							</AccordionDetails>
						)}
					</Accordion>
				) : (
					<ListItem className='flex !items-center !w-full !pl-10' key={item.id}>
						{calculateCheckboxState && (
							<Checkbox
								checked={selectedMenus[item.id]?.status || false}
								disabled={permissonProfileData.some(
									(perm) =>
										Boolean(perm.id_profile) && Boolean(perm.status) && perm.id_menu == item.id
								)}
								onClick={(event) => {
									event.stopPropagation()
									let type_select = permissonProfileData.length ? 'user_id' : 'profile'
									handleCheckboxChange(item.id, [], type_select)
								}}
							/>
						)}
						<Typography className='flex items-center'>{item.name}</Typography>
						{newSubMenu ? (
							<BtnActions
								data={item}
								optCreate={newSubMenu}
								optEdit={editSubMenu}
								optDelete={deleteSubMenu}
							/>
						) : null}
					</ListItem>
				)}
			</div>
		)
	})
}

export default MenuItems
