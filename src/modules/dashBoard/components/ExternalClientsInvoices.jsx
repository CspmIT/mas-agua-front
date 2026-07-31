import { useContext, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material'
import { ArrowDownward, ReceiptLong } from '@mui/icons-material'
import { MainContext } from '../../../context/MainContext'
import TabsInvoice from '../../ExternalUsers/components/TabsInvoice'
import ChartInvoice from '../../ExternalUsers/components/ChartInvoice'

// Tenants internos que monitorean la facturacion de los clientes externos
const INVOICES_CLIENTS = ['Coop Morteros', 'Coop desarrollo 2']

// Clientes externos con medicion de consumo facturable
const EXTERNAL_CLIENTS = [
    { key: 'adeco', label: 'AdecoAgro' },
    { key: 'lactear', label: 'Lactear' },
]

const accordionTitlePillSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    px: 2.5,
    py: 0.75,
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
        transform: 'translateY(-1px)',
    },
}

const InvoiceAccordion = ({ client }) => {
    const [expanded, setExpanded] = useState(false)
    // Se monta el contenido recien al expandir para no pegarle al backend al cargar la vista
    const [opened, setOpened] = useState(false)

    const handleChange = (event, isExpanded) => {
        setExpanded(isExpanded)
        if (isExpanded) setOpened(true)
    }

    return (
        <Accordion
            expanded={expanded}
            onChange={handleChange}
            sx={{ border: 'none', '&:before': { display: 'none' }, gap: 2 }}
            className="w-full !rounded-xl mb-2 !shadow-md"
        >
            <AccordionSummary
                expandIcon={<ArrowDownward sx={{ color: '#0f766e' }} />}
                aria-controls={`panel-invoice-${client.key}-content`}
                id={`panel-invoice-${client.key}-header`}
                className="!border-transparent !rounded-2xl"
            >
                <Box component="span" sx={accordionTitlePillSx}>
                    <ReceiptLong sx={{ fontSize: 15, color: 'white' }} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white leading-none">
                        Facturación — {client.label}
                    </span>
                </Box>
            </AccordionSummary>

            <AccordionDetails className="flex flex-col gap-4 h-auto !rounded-2xl !border-transparent">
                {opened && (
                    <>
                        <TabsInvoice client={client.key} />
                        <ChartInvoice client={client.key} />
                    </>
                )}
            </AccordionDetails>
        </Accordion>
    )
}

// Seccion de /chart para usuarios internos: facturacion de los clientes
// externos (AdecoAgro y Lactear) visible en simultaneo, un acordeon por cliente
const ExternalClientsInvoices = () => {
    const { client } = useContext(MainContext)

    if (!INVOICES_CLIENTS.includes(client)) return null

    return (
        <div className="w-full mt-4">
            <div className="flex items-center gap-2 px-1 pt-1 pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                <ReceiptLong sx={{ fontSize: 16, color: '#0d9488' }} />
                Facturación clientes externos
            </div>
            {EXTERNAL_CLIENTS.map((externalClient) => (
                <InvoiceAccordion key={externalClient.key} client={externalClient} />
            ))}
        </div>
    )
}

export default ExternalClientsInvoices
