import { IconButton } from '@mui/material'
import { useState } from 'react'
import { MdInstallDesktop } from "react-icons/md";
import DesktopDownloadModal from './downloadModal';

const ButtonDownloads = () => {
    const [openModal, setOpenModal] = useState(false)
    return (
        <>
            <IconButton variant='contained' size='medium' title='Descargar versión de escritorio' onClick={() => setOpenModal(true)}>
                <MdInstallDesktop />
            </IconButton>
            <DesktopDownloadModal
                open={openModal}
                onClose={() => setOpenModal(false)}
            />
        </>
    )
}

export default ButtonDownloads