import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    TextField,
    Popover,
    List,
    ListItem,
    ListItemText,
    InputAdornment,
    IconButton,
} from '@mui/material'
import { Search, Add, Visibility, ExpandMore } from '@mui/icons-material'
import ModalVar from '../../../components/DataGenerator/ModalVar'
import { getVarsInflux } from '../../DrawDiagram/components/Fields/actions'

const SelectVars = ({
    label,
    setValue,
    setValueState = false,
    initialVar = false,
    className = false,
    onSelect = null,
}) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOption, setSelectedOption] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [modalData, setModalData] = useState(null)
    const [options, setOptions] = useState([])

    const fetchVars = async () => {
        const vars = await getVarsInflux()
        setOptions(vars)
        //Obtengo la variable seleccionada para actualizarla con los datos de la base de datos
        if (initialVar) {
            setSelectedOption(initialVar)
        }
        if (selectedOption !== null) {
            const varSelected = vars.find((v) => v.id === selectedOption.id)
            setSelectedOption(varSelected)
            if (setValueState) {
                setValueState(varSelected)
            } else {
                setValue('idVar', varSelected.id)
            }
        }
    }

    useEffect(() => {
        if (initialVar) {
            handleSelectOption(initialVar)
        }
    }, [initialVar])

    useEffect(() => {
        fetchVars()
    }, [isDialogOpen])

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined

    const filteredOptions = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectOption = (option) => {
        setSelectedOption(option)
    
        if (onSelect) {
            onSelect(option)          
        } else if (setValueState) {
            setValueState(option)
        } else {
            setValue('idVar', option.id)
        }
    
        handleClose()
    }

    const handleViewClick = () => {
        setModalData(selectedOption)
        setIsDialogOpen(true)
    }

    return (
        <Box sx={{ width: '100%', margin: 'auto', display: 'flex' }} className={className} >
            <Button
                aria-describedby={id}
                variant="outlined"
                color="inherit"
                onClick={handleClick}
                endIcon={<ExpandMore />}
                fullWidth
                sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'black',

                }}
            >
                {selectedOption ? selectedOption.name : label}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ p: 2, width: '100%' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Buscar variable..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <List sx={{ overflow: 'auto', mt: 1 }}>
                        {filteredOptions.map((option) => (
                            <ListItem
                                button
                                key={option.id}
                                onClick={() => handleSelectOption(option)}
                            >
                                <ListItemText primary={option.name} />
                            </ListItem>
                        ))}
                    </List>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                            setModalData(null)
                            setIsDialogOpen(true)
                        }}
                        sx={{ mt: 2 }}
                    >
                        Agregar nueva opción
                    </Button>
                </Box>
            </Popover>

            {selectedOption && (
                <Box sx={{ alignItems: 'center' }}>
                    <IconButton onClick={handleViewClick} size="small">
                        <Visibility />
                    </IconButton>
                </Box>
            )}

            <ModalVar
                openModal={isDialogOpen}
                setOpenModal={setIsDialogOpen}
                data={modalData}
            />
        </Box>
    )
}

export default SelectVars
