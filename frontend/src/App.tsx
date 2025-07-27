import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography } from '@mui/material';
import Dashboard from './pages/Dashboard';
import EquipmentSidebar from './components/EquipmentSidebar';
import SimpleCalendar from './components/SimpleCalendar';
import BatchDialog from './components/BatchDialog';
import BatchCreationTests from './components/BatchCreationTests';
import { MOCK_EQUIPMENT, MOCK_BATCHES, CreateBatchRequest, BatchStatus, Batch, Equipment } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [batches, setBatches] = useState(MOCK_BATCHES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | undefined>();
  const [prefilledData, setPrefilledData] = useState<{
    equipment?: Equipment;
    startTime?: Date;
    endTime?: Date;
  }>({});

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedEquipment(selectedIds);
  };

  const handleCreateBatch = (batchData: CreateBatchRequest) => {
    const newBatch = {
      id: `batch-${Date.now()}`,
      ...batchData,
      status: BatchStatus.SCHEDULED,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setBatches(prev => [...prev, newBatch]);
    console.log('New batch created:', newBatch);
  };

  const handleEditBatch = (batchData: CreateBatchRequest) => {
    if (!editingBatch) return;
    
    const updatedBatch = {
      ...editingBatch,
      ...batchData,
      updated_at: new Date().toISOString()
    };
    
    setBatches(prev => prev.map(batch => 
      batch.id === editingBatch.id ? updatedBatch : batch
    ));
    console.log('Batch updated:', updatedBatch);
  };

  const handleBatchSave = (batchData: CreateBatchRequest) => {
    if (editingBatch) {
      handleEditBatch(batchData);
    } else {
      handleCreateBatch(batchData);
    }
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBatch(undefined);
    setPrefilledData({});
  };

  const openCreateDialog = (equipment?: Equipment, startTime?: Date, endTime?: Date) => {
    setEditingBatch(undefined);
    setPrefilledData({ equipment, startTime, endTime });
    setDialogOpen(true);
  };

  const openEditDialog = (batch: Batch) => {
    setEditingBatch(batch);
    setPrefilledData({});
    setDialogOpen(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            <EquipmentSidebar
              equipment={MOCK_EQUIPMENT}
              selectedEquipment={selectedEquipment}
              onSelectionChange={handleSelectionChange}
            />
            
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <AppBar position="static" elevation={1}>
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Batch Scheduler
                  </Typography>
                  {selectedEquipment.length > 0 && (
                    <Typography variant="body2">
                      {selectedEquipment.length} equipment selected
                    </Typography>
                  )}
                </Toolbar>
              </AppBar>
              
              <Box component="main" sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <SimpleCalendar
                        batches={batches}
                        equipment={MOCK_EQUIPMENT}
                        selectedEquipment={selectedEquipment}
                        onCreateBatch={openCreateDialog}
                        onEditBatch={openEditDialog}
                      />
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={<Dashboard selectedEquipment={selectedEquipment} />} 
                  />
                  <Route 
                    path="/tests" 
                    element={<BatchCreationTests />} 
                  />
                </Routes>
              </Box>
            </Box>
          </Box>

          {/* Batch Dialog */}
          <BatchDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            onSave={handleBatchSave}
            equipment={MOCK_EQUIPMENT}
            existingBatches={batches}
            editBatch={editingBatch}
            prefilledEquipment={prefilledData.equipment}
            prefilledStartTime={prefilledData.startTime}
            prefilledEndTime={prefilledData.endTime}
          />
        </Router>
      </ThemeProvider>
    </DndProvider>
  );
}

export default App;