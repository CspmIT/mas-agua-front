import { Accordion, AccordionSummary, AccordionDetails, Checkbox, Typography, List, ListItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function MenuItems({
	items,
	expandedAccordions,
	handleAccordionChange,
	selectedMenus,
	toggleMenu,
	isSuperAdmin,
})
{
	return items.map((item) => {
		const number = 240 - parseInt(item.level) * 20;
		const isExpanded = expandedAccordions[item.id] || false;

		return (
			<div key={item.id} className="!w-full">
				{item.subMenus.length ? (
					<Accordion
						expanded={isExpanded}
						onChange={handleAccordionChange(item.id)}
						sx={{ backgroundColor: isExpanded ? `rgb(${number},${number},${number})` : 'transparent' }}
						className="!shadow-none"
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							sx={{ flexDirection: 'row-reverse' }}
						>
							<Checkbox
								checked={!!selectedMenus[item.id]?.effective}
								disabled={!isSuperAdmin}
								onClick={(e) => {
									e.stopPropagation();
									toggleMenu(item.id);
								}}
							/>
							<Typography>{item.name}</Typography>
						</AccordionSummary>

						<AccordionDetails className="!pl-14">
							<List>
								<MenuItems
									items={item.subMenus}
									expandedAccordions={expandedAccordions}
									handleAccordionChange={handleAccordionChange}
									selectedMenus={selectedMenus}
									toggleMenu={toggleMenu}
									isSuperAdmin={isSuperAdmin}
								/>
							</List>
						</AccordionDetails>
					</Accordion>
				) : (
					<ListItem className="!pl-10">
						<Checkbox
							checked={!!selectedMenus[item.id]?.effective}
							disabled={!isSuperAdmin}
							onClick={() => toggleMenu(item.id)}
						/>
						<Typography>{item.name}</Typography>
					</ListItem>
				)}
			</div>
		);
	});
}

export default MenuItems;