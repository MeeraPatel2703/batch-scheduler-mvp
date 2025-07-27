import React, { useState, useEffect, useCallback } from 'react';
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
  Stack,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { Equipment, Batch, CreateBatchRequest, BatchPriority } from '../types';
import { detectSchedulingConflicts, formatConflictMessage, ConflictInfo } from '../utils/conflictDetection';

interface BatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (batchData: CreateBatchRequest) => void;
  equipment: Equipment[];
  existingBatches: Batch[];
  editBatch?: Batch;
  prefilledEquipment?: Equipment;
  prefilledStartTime?: Date;
  prefilledEndTime?: Date;
}

interface FormData {
  equipment_id: string;
  product_name: string;
  start_time: string;
  end_time: string;
  batch_size: string;
  priority: BatchPriority;
  operator: string;
  recipe_id: string;
  notes: string;
}

interface FormErrors {
  equipment_id?: string;
  product_name?: string;
  start_time?: string;
  end_time?: string;
  batch_size?: string;
  operator?: string;
  conflict?: string;
}

const BatchDialog: React.FC<BatchDialogProps> = ({
  open,
  onClose,
  onSave,
  equipment,
  existingBatches,
  editBatch,
  prefilledEquipment,
  prefilledStartTime,
  prefilledEndTime
}) => {
  const [formData, setFormData] = useState<FormData>({
    equipment_id: '',
    product_name: '',
    start_time: '',
    end_time: '',
    batch_size: '',
    priority: BatchPriority.NORMAL,
    operator: '',
    recipe_id: '',
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [conflicts, setConflicts] = useState<ConflictInfo>({ hasConflicts: false, conflictingBatches: [] });
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const isEditMode = !!editBatch;

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (editBatch) {
        // Editing existing batch
        const startTime = new Date(editBatch.start_time);
        const endTime = new Date(editBatch.end_time);
        
        setFormData({
          equipment_id: editBatch.equipment_id,
          product_name: editBatch.product_name,
          start_time: startTime.toISOString().slice(0, 16),
          end_time: endTime.toISOString().slice(0, 16),
          batch_size: editBatch.batch_size?.toString() || '',
          priority: editBatch.priority || BatchPriority.NORMAL,
          operator: editBatch.operator || '',
          recipe_id: editBatch.recipe_id || '',
          notes: editBatch.notes || ''
        });
      } else {
        // Creating new batch
        const startTime = prefilledStartTime || new Date();
        const endTime = prefilledEndTime || new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
        
        setFormData({
          equipment_id: prefilledEquipment?.id || '',
          product_name: '',
          start_time: startTime.toISOString().slice(0, 16),
          end_time: endTime.toISOString().slice(0, 16),
          batch_size: '',
          priority: BatchPriority.NORMAL,
          operator: '',
          recipe_id: '',
          notes: ''
        });
      }
      
      setErrors({});
      setConflicts({ hasConflicts: false, conflictingBatches: [] });
      setTouched(new Set());
    }
  }, [open, editBatch, prefilledEquipment, prefilledStartTime, prefilledEndTime]);

  // Real-time validation
  const validateField = useCallback((field: keyof FormData, value: string): string => {
    switch (field) {
      case 'equipment_id':
        return value ? '' : 'Equipment is required';
      
      case 'product_name':
        return value.trim() ? '' : 'Product name is required';
      
      case 'start_time':
        if (!value) return 'Start time is required';
        const startDate = new Date(value);
        const now = new Date();
        if (startDate < now && !isEditMode) {
          return 'Start time cannot be in the past';
        }
        return '';
      
      case 'end_time':
        if (!value) return 'End time is required';
        if (!formData.start_time) return '';
        const start = new Date(formData.start_time);
        const end = new Date(value);
        if (end <= start) {
          return 'End time must be after start time';
        }
        return '';
      
      case 'batch_size':
        if (!value) return 'Batch size is required';
        const size = parseFloat(value);
        if (isNaN(size) || size <= 0) {
          return 'Batch size must be a positive number';
        }
        return '';
      
      case 'operator':
        return value.trim() ? '' : 'Operator is required';
      
      default:
        return '';
    }
  }, [formData.start_time, isEditMode]);

  // Check for conflicts whenever form data changes
  const checkConflicts = useCallback(() => {
    if (!formData.equipment_id || !formData.start_time || !formData.end_time) {
      setConflicts({ hasConflicts: false, conflictingBatches: [] });
      return;
    }

    try {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      
      if (startTime >= endTime) {
        setConflicts({ hasConflicts: false, conflictingBatches: [] });
        return;
      }

      const conflictInfo = detectSchedulingConflicts(
        formData.equipment_id,
        startTime,
        endTime,
        existingBatches,
        editBatch?.id
      );

      setConflicts(conflictInfo);
      
      if (conflictInfo.hasConflicts) {
        setErrors(prev => ({
          ...prev,
          conflict: formatConflictMessage(conflictInfo)
        }));
      } else {
        setErrors(prev => {
          const { conflict, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setConflicts({ hasConflicts: false, conflictingBatches: [] });
    }
  }, [formData.equipment_id, formData.start_time, formData.end_time, existingBatches, editBatch?.id]);

  // Run conflict check when relevant fields change
  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  // Handle input changes with real-time validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouched(prev => new Set(prev).add(field));
    
    // Validate immediately for better UX
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle field blur (for validation feedback)
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => new Set(prev).add(field));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const fields: (keyof FormData)[] = ['equipment_id', 'product_name', 'start_time', 'end_time', 'batch_size', 'operator'];
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error && field in newErrors) {
        (newErrors as any)[field] = error;
        isValid = false;
      } else if (error) {
        (newErrors as any)[field] = error;
        isValid = false;
      }
    });

    if (conflicts.hasConflicts) {
      newErrors.conflict = formatConflictMessage(conflicts);
      isValid = false;
    }

    setErrors(newErrors);
    setTouched(new Set(fields));
    return isValid;
  };

  // Check if form can be saved
  const canSave = (): boolean => {
    const requiredFields = ['equipment_id', 'product_name', 'start_time', 'end_time', 'batch_size', 'operator'];
    const hasAllFields = requiredFields.every(field => formData[field as keyof FormData].trim());
    const hasNoErrors = Object.keys(errors).length === 0;
    const hasNoConflicts = !conflicts.hasConflicts;
    
    return hasAllFields && hasNoErrors && hasNoConflicts;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const batchData: CreateBatchRequest = {
      equipment_id: formData.equipment_id,
      product_name: formData.product_name.trim(),
      start_time: formData.start_time,
      end_time: formData.end_time,
      batch_size: parseFloat(formData.batch_size),
      priority: formData.priority,
      operator: formData.operator.trim(),
      recipe_id: formData.recipe_id || undefined,
      notes: formData.notes.trim() || undefined
    };

    onSave(batchData);
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      equipment_id: '',
      product_name: '',
      start_time: '',
      end_time: '',
      batch_size: '',
      priority: BatchPriority.NORMAL,
      operator: '',
      recipe_id: '',
      notes: ''
    });
    setErrors({});
    setConflicts({ hasConflicts: false, conflictingBatches: [] });
    setTouched(new Set());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">
          {isEditMode ? 'Edit Batch' : 'Create New Batch'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Conflict Alert */}
          {conflicts.hasConflicts && (
            <Alert severity="error">
              <Typography variant="body2">
                {formatConflictMessage(conflicts)}
              </Typography>
            </Alert>
          )}

          {/* Equipment Selection */}
          <FormControl 
            fullWidth 
            error={touched.has('equipment_id') && !!errors.equipment_id}
          >
            <InputLabel>Equipment *</InputLabel>
            <Select
              value={formData.equipment_id}
              label="Equipment *"
              onChange={(e) => handleInputChange('equipment_id', e.target.value)}
              onBlur={() => handleBlur('equipment_id')}
            >
              {equipment.map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>
                  <Box>
                    <Typography variant="body1">{eq.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {eq.type} • Capacity: {eq.capacity}L • {eq.location}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {touched.has('equipment_id') && errors.equipment_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.equipment_id}
              </Typography>
            )}
          </FormControl>

          {/* Product Name */}
          <TextField
            fullWidth
            label="Product Name"
            required
            value={formData.product_name}
            onChange={(e) => handleInputChange('product_name', e.target.value)}
            onBlur={() => handleBlur('product_name')}
            error={touched.has('product_name') && !!errors.product_name}
            helperText={touched.has('product_name') && errors.product_name}
          />

          {/* Time Fields */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Start Time"
              type="datetime-local"
              required
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              onBlur={() => handleBlur('start_time')}
              error={touched.has('start_time') && !!errors.start_time}
              helperText={touched.has('start_time') && errors.start_time}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="datetime-local"
              required
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              onBlur={() => handleBlur('end_time')}
              error={touched.has('end_time') && !!errors.end_time}
              helperText={touched.has('end_time') && errors.end_time}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Batch Size and Priority */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Batch Size (L)"
              type="number"
              required
              value={formData.batch_size}
              onChange={(e) => handleInputChange('batch_size', e.target.value)}
              onBlur={() => handleBlur('batch_size')}
              error={touched.has('batch_size') && !!errors.batch_size}
              helperText={touched.has('batch_size') && errors.batch_size}
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value as BatchPriority)}
              >
                <MenuItem value={BatchPriority.LOW}>Low</MenuItem>
                <MenuItem value={BatchPriority.NORMAL}>Normal</MenuItem>
                <MenuItem value={BatchPriority.HIGH}>High</MenuItem>
                <MenuItem value={BatchPriority.URGENT}>Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Operator */}
          <TextField
            fullWidth
            label="Operator"
            required
            value={formData.operator}
            onChange={(e) => handleInputChange('operator', e.target.value)}
            onBlur={() => handleBlur('operator')}
            error={touched.has('operator') && !!errors.operator}
            helperText={touched.has('operator') && errors.operator}
          />

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Optional notes about this batch..."
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSave()}
          color={conflicts.hasConflicts ? "error" : "primary"}
        >
          {isEditMode ? 'Update Batch' : 'Create Batch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchDialog;