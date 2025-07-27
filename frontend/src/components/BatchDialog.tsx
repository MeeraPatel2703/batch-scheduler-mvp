import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  AccessTime,
  Schedule,
  Build,
  Person,
  Settings,
  Warning,
  CheckCircle,
  FastForward,
  Close
} from '@mui/icons-material';
import { Equipment, Batch, CreateBatchRequest, BatchPriority } from '../types';
import { detectSchedulingConflicts, formatConflictMessage, ConflictInfo } from '../utils/conflictDetection';
import { MOCK_PRODUCTS, MOCK_OPERATORS, MOCK_RECIPES } from '../data/mockData';

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

interface BatchTemplate {
  id: string;
  name: string;
  product: string;
  duration: number;
  priority: BatchPriority;
  description: string;
}

const BATCH_TEMPLATES: BatchTemplate[] = [
  {
    id: 'quick-pharma',
    name: 'Quick Pharmaceutical Batch',
    product: 'Pharmaceutical Compound XR-25',
    duration: 4,
    priority: BatchPriority.HIGH,
    description: 'Standard 4-hour pharmaceutical production'
  },
  {
    id: 'standard-polymer',
    name: 'Standard Polymer Process',
    product: 'Industrial Polymer P-402',
    duration: 8,
    priority: BatchPriority.NORMAL,
    description: 'Full 8-hour polymer manufacturing cycle'
  },
  {
    id: 'rush-specialty',
    name: 'Rush Specialty Chemical',
    product: 'Specialty Chemical SC-789',
    duration: 6,
    priority: BatchPriority.URGENT,
    description: 'High-priority specialty chemical production'
  }
];

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
  const [activeStep, setActiveStep] = useState(0);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BatchTemplate | null>(null);
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<ConflictInfo>({ hasConflicts: false, conflictingBatches: [] });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditMode = !!editBatch;
  const steps = ['Setup', 'Details', 'Review'];

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (isEditMode && editBatch) {
        // Edit mode - populate with existing batch data
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
        setActiveStep(0);
        setShowAdvanced(true);
      } else {
        // Create mode - use prefilled data or defaults
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
        setActiveStep(0);
        setUseTemplate(false);
        setSelectedTemplate(null);
        setShowAdvanced(false);
      }
      setErrors({});
    }
  }, [open, editBatch, prefilledEquipment, prefilledStartTime, prefilledEndTime, isEditMode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTemplateSelect = (template: BatchTemplate) => {
    setSelectedTemplate(template);
    const startTime = prefilledStartTime || new Date();
    const endTime = new Date(startTime.getTime() + template.duration * 60 * 60 * 1000);
    
    setFormData(prev => ({
      ...prev,
      product_name: template.product,
      priority: template.priority,
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16)
    }));
    setActiveStep(1);
  };

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = MOCK_RECIPES.find(r => r.id === recipeId);
    if (recipe && formData.start_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(startTime.getTime() + recipe.duration_hours * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        recipe_id: recipeId,
        end_time: endTime.toISOString().slice(0, 16)
      }));
    } else {
      setFormData(prev => ({ ...prev, recipe_id: recipeId }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const getAvailableEquipment = () => {
    return equipment.filter(eq => eq.status === 'active' || eq.id === formData.equipment_id);
  };

  // Check for conflicts whenever relevant form fields change
  useEffect(() => {
    if (formData.equipment_id && formData.start_time && formData.end_time) {
      try {
        const startTime = new Date(formData.start_time);
        const endTime = new Date(formData.end_time);
        
        if (startTime < endTime) {
          const conflictInfo = detectSchedulingConflicts(
            formData.equipment_id,
            startTime,
            endTime,
            existingBatches,
            editBatch?.id // Exclude current batch when editing
          );
          setConflicts(conflictInfo);
        } else {
          setConflicts({ hasConflicts: false, conflictingBatches: [] });
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
        setConflicts({ hasConflicts: false, conflictingBatches: [] });
      }
    } else {
      setConflicts({ hasConflicts: false, conflictingBatches: [] });
    }
  }, [formData.equipment_id, formData.start_time, formData.end_time, existingBatches, editBatch?.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.equipment_id) {
      newErrors.equipment_id = 'Equipment is required';
    }
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    // Time validation
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      
      if (endTime <= startTime) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    // Batch size validation (if provided)
    if (formData.batch_size && (isNaN(Number(formData.batch_size)) || Number(formData.batch_size) <= 0)) {
      newErrors.batch_size = 'Batch size must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || conflicts.hasConflicts) {
      return;
    }

    const batchData: CreateBatchRequest = {
      equipment_id: formData.equipment_id,
      product_name: formData.product_name.trim(),
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
      batch_size: formData.batch_size ? Number(formData.batch_size) : undefined,
      priority: formData.priority,
      operator: formData.operator.trim() || undefined,
      notes: formData.notes.trim() || undefined
    };

    onSave(batchData);
  };

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
    onClose();
  };

  const selectedEquipment = equipment.find(eq => eq.id === formData.equipment_id);

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
        <Typography variant="h6">
          {isEditMode ? 'Edit Batch' : 'Create New Batch'}
        </Typography>
        {selectedEquipment && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Equipment: {selectedEquipment.name} ({selectedEquipment.type})
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Equipment and Product Name Row */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth error={!!errors.equipment_id}>
              <InputLabel>Equipment *</InputLabel>
              <Select
                value={formData.equipment_id}
                label="Equipment *"
                onChange={(e) => handleInputChange('equipment_id', e.target.value)}
                disabled={isEditMode} // Don't allow equipment change in edit mode
              >
                {equipment.map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>
                    <Box>
                      <Typography variant="body1">{eq.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {eq.type} • {eq.status}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.equipment_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.equipment_id}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Product Name *"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              error={!!errors.product_name}
              helperText={errors.product_name}
              placeholder="e.g., Acetaminophen Tablets"
            />
          </Box>

          {/* Time Row */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Start Time *"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
              error={!!errors.start_time}
              helperText={errors.start_time}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="End Time *"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
              error={!!errors.end_time}
              helperText={errors.end_time}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Batch Size and Priority Row */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Batch Size"
              type="number"
              value={formData.batch_size}
              onChange={(e) => handleInputChange('batch_size', e.target.value)}
              error={!!errors.batch_size}
              helperText={errors.batch_size || 'Optional: Enter batch size in kg'}
              placeholder="e.g., 1000"
              InputProps={{
                endAdornment: <Typography variant="body2" color="text.secondary">kg</Typography>
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleInputChange('priority', e.target.value)}
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
            value={formData.operator}
            onChange={(e) => handleInputChange('operator', e.target.value)}
            placeholder="e.g., John Smith"
          />

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or special instructions..."
          />
        </Stack>

        {/* Conflict Warning */}
        {conflicts.hasConflicts && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" component="div">
              <strong>Scheduling Conflict Detected</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {formatConflictMessage(conflicts)}
            </Typography>
            {conflicts.conflictingBatches.length === 1 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  The selected time overlaps with an existing batch. Please choose a different time slot or equipment.
                </Typography>
              </Box>
            )}
            {conflicts.conflictingBatches.length > 1 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Conflicting batches:
                </Typography>
                <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                  {conflicts.conflictingBatches.map((conflict, index) => (
                    <Typography key={index} variant="caption" component="li" color="text.secondary">
                      {conflict.batch.product_name} ({new Date(conflict.batch.start_time).toLocaleDateString()} {new Date(conflict.batch.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(conflict.batch.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the validation errors above before saving.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={Object.keys(errors).length > 0 || conflicts.hasConflicts}
        >
          {isEditMode ? 'Update Batch' : 'Create Batch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchDialog;