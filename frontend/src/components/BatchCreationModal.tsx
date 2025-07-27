import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { Equipment, BatchPriority, CreateBatchRequest } from '../types';

interface BatchCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreateBatch: (batch: CreateBatchRequest) => void;
  equipment: Equipment;
  startTime: Date;
  endTime: Date;
}

const BatchCreationModal: React.FC<BatchCreationModalProps> = ({
  open,
  onClose,
  onCreateBatch,
  equipment,
  startTime,
  endTime
}) => {
  const [productName, setProductName] = useState('');
  const [batchSize, setBatchSize] = useState<number>(equipment.capacity ? Math.floor(equipment.capacity * 0.8) : 100);
  const [priority, setPriority] = useState<BatchPriority>(BatchPriority.NORMAL);
  const [operator, setOperator] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    const newBatch: CreateBatchRequest = {
      equipment_id: equipment.id,
      product_name: productName.trim(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      batch_size: batchSize,
      priority,
      operator: operator.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onCreateBatch(newBatch);
    handleClose();
  };

  const handleClose = () => {
    setProductName('');
    setBatchSize(equipment.capacity ? Math.floor(equipment.capacity * 0.8) : 100);
    setPriority(BatchPriority.NORMAL);
    setOperator('');
    setNotes('');
    onClose();
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 100)) / 100;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create New Batch
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Equipment: {equipment.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={equipment.type} size="small" variant="outlined" />
            <Chip 
              label={equipment.status} 
              size="small" 
              color={equipment.status === 'active' ? 'success' : 'default'}
            />
            {equipment.capacity && (
              <Chip label={`${equipment.capacity}L capacity`} size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Scheduled Time:
          </Typography>
          <Typography variant="body2">
            <strong>Start:</strong> {formatDateTime(startTime)}
          </Typography>
          <Typography variant="body2">
            <strong>End:</strong> {formatDateTime(endTime)}
          </Typography>
          <Typography variant="body2">
            <strong>Duration:</strong> {duration} hours
          </Typography>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          label="Product Name"
          fullWidth
          variant="outlined"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g., Pharmaceutical Compound ABC-123"
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Batch Size (L)"
          type="number"
          fullWidth
          variant="outlined"
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
          inputProps={{ min: 1, max: equipment.capacity }}
          helperText={equipment.capacity ? `Max capacity: ${equipment.capacity}L` : ''}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as BatchPriority)}
            label="Priority"
          >
            <MenuItem value={BatchPriority.LOW}>Low</MenuItem>
            <MenuItem value={BatchPriority.NORMAL}>Normal</MenuItem>
            <MenuItem value={BatchPriority.HIGH}>High</MenuItem>
            <MenuItem value={BatchPriority.URGENT}>Urgent</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label="Operator (Optional)"
          fullWidth
          variant="outlined"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          placeholder="e.g., John Smith"
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Notes (Optional)"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or special instructions..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Batch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchCreationModal;