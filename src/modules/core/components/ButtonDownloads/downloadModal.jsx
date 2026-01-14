import {
    Box,
    Modal,
    Typography,
    IconButton,
    Button,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material'
import { MdClose } from 'react-icons/md'
import { FaWindows, FaLinux } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { getDesktopDownloads } from '../../utils/getDesktopDownloads'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 3
}

const DesktopDownloadModal = ({ open, onClose }) => {
    const [downloads, setDownloads] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return

        setLoading(true)
        getDesktopDownloads()
            .then(setDownloads)
            .finally(() => setLoading(false))
    }, [open])

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style} className='text-black dark:text-white'>
                {/* Header */}
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>
                        Descargar Mas Agua {downloads?.version || ""}
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <MdClose />
                    </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                {loading && (
                    <Box textAlign="center" py={4}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && downloads && (
                    <>
                        {/* Windows */}
                        <Box mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <FaWindows />
                                <Typography fontWeight={600}>Windows</Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 1 }}
                                href={downloads.windows?.browser_download_url}
                                disabled={!downloads.windows}
                            >
                                Descargar
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Linux */}
                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <FaLinux />
                                <Typography fontWeight={600}>Linux</Typography>
                                <Chip
                                    label="AppImage recomendado"
                                    size="small"
                                    color="success"
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                sx={{ mt: 1 }}
                                href={downloads.appImage?.browser_download_url}
                                disabled={!downloads.appImage}
                            >
                                Descargar AppImage
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mt: 1 }}
                                href={downloads.deb?.browser_download_url}
                                disabled={!downloads.deb}
                            >
                                Descargar .deb
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    )
}

export default DesktopDownloadModal
