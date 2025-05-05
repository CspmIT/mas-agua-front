import React, { useState, useEffect } from 'react';
import { 
  Select, 
  MenuItem, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const SelectorVars= () => {
  const [variables, setVariables] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState('');
  const [graphData, setGraphData] = useState([
,
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDataName, setNewDataName] = useState('');
  const [newDataType, setNewDataType] = useState('y');

  // Simula la obtención de variables desde la base de datos
  useEffect(() => {
    // Aquí deberías hacer tu llamada a la API o base de datos
    const fetchVariables = async () => {
      // Simulamos variables de ejemplo
      const fetchedVariables = ['Ventas', 'Costos', 'Ganancias', 'Tiempo'];
      setVariables(fetchedVariables);
    };

    fetchVariables();
  }, []);

  const handleVariableChange = (event) => {
    setSelectedVariable(event.target.value);
  };

  const handleAssignVariable = (id) => {
    setGraphData(graphData.map(item => 
      item.id === id ? { ...item, variable: selectedVariable } : item
    ));
    setSelectedVariable('');
  };

  const handleAddGraphData = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewDataName('');
    setNewDataType('y');
  };

  const handleConfirmAddData = () => {
    if (newDataName) {
      const newId = newDataType === 'x' ? 'x' : `y${graphData.filter(item => item.type === 'y').length + 1}`;
      setGraphData([...graphData, { 
        id: newId, 
        name: newDataName, 
        variable: '', 
        type: newDataType 
      }]);
      handleCloseDialog();
    }
  };

  const handleRemoveGraphData = (id) => {
    setGraphData(graphData.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Selector de Variables para Gráfico</h2>
      
      <Select
        value={selectedVariable}
        onChange={handleVariableChange}
        displayEmpty
        fullWidth
        className="mb-4"
      >
        <MenuItem value="" disabled>Selecciona una variable</MenuItem>
        {variables.map((variable, index) => (
          <MenuItem key={index} value={variable}>{variable}</MenuItem>
        ))}
      </Select>
      <Button>Agregar</Button>

      <List className="mb-4">
        {graphData.map((item) => (
          <ListItem key={item.id} className="flex justify-between items-center">
            <ListItemText 
              primary={item.name} 
              secondary={`${item.variable || 'No asignada'} (${item.type === 'x' ? 'Eje X' : 'Eje Y'})`} 
            />
            <div>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleAssignVariable(item.id)}
                disabled={!selectedVariable}
                className="mr-2"
              >
                Asignar
              </Button>
              {item.id !== 'x' && item.id !== 'y1' && (
                <IconButton onClick={() => handleRemoveGraphData(item.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          </ListItem>
        ))}
      </List>

      <Button 
        variant="outlined" 
        color="primary" 
        onClick={handleAddGraphData}
        fullWidth
      >
        Agregar Nuevo Dato
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Agregar Nuevo Dato</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre del Dato"
            type="text"
            fullWidth
            variant="standard"
            value={newDataName}
            onChange={(e) => setNewDataName(e.target.value)}
          />
          <Select
            value={newDataType}
            onChange={(e) => setNewDataType(e.target.value)}
            fullWidth
            className="mt-4"
          >
            <MenuItem value="x">Eje X</MenuItem>
            <MenuItem value="y">Eje Y</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmAddData}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SelectorVars;

