import React from 'react';
import { useDrag } from 'react-dnd';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  Science as ReactorIcon,
  Blender as MixerIcon,
  LocalLaundryService as DryerIcon,
  Inventory as PackagingIcon,
  LinearScale as ConveyorIcon,
  Storage as StorageIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { Equipment, EquipmentType, EquipmentStatus } from '../types/equipment';

interface EquipmentSidebarProps {
  equipment: Equipment[];
  selectedEquipment: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

interface DraggableEquipmentItemProps {
  equipment: Equipment;
  isSelected: boolean;
  onSelect: () => void;
}

const getEquipmentIcon = (type: EquipmentType) => {
  switch (type) {
    case EquipmentType.REACTOR:
      return <ReactorIcon fontSize="small" />;
    case EquipmentType.MIXER:
      return <MixerIcon fontSize="small" />;
    case EquipmentType.DRYER:
      return <DryerIcon fontSize="small" />;
    case EquipmentType.PACKAGING:
      return <PackagingIcon fontSize="small" />;
    case EquipmentType.CONVEYOR:
      return <ConveyorIcon fontSize="small" />;
    case EquipmentType.STORAGE:
      return <StorageIcon fontSize="small" />;
    default:
      return null;
  }
};

const getStatusColor = (status: EquipmentStatus) => {
  switch (status) {
    case EquipmentStatus.ACTIVE:
      return 'success';
    case EquipmentStatus.IN_USE:
      return 'warning';
    case EquipmentStatus.MAINTENANCE:
      return 'error';
    case EquipmentStatus.OFFLINE:
      return 'default';
    default:
      return 'default';
  }
};

const DraggableEquipmentItem: React.FC<DraggableEquipmentItemProps> = ({
  equipment,
  isSelected,
  onSelect
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'equipment',
    item: { equipment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <ListItem disablePadding ref={drag}>
      <ListItemButton
        onClick={onSelect}
        selected={isSelected}
        sx={{
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          '&:hover': {
            backgroundColor: isSelected ? 'action.selected' : 'action.hover',
          },
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          },
          px: 2,
          py: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          {getEquipmentIcon(equipment.type)}
        </Box>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                {equipment.name}
              </Typography>
              <DragIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          }
          secondary={
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                label={equipment.type}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
              <Chip
                label={equipment.status}
                size="small"
                color={getStatusColor(equipment.status) as any}
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Stack>
          }
        />
        
        {equipment.capacity && (
          <Box sx={{ ml: 1, textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {equipment.capacity}L
            </Typography>
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

const EquipmentSidebar: React.FC<EquipmentSidebarProps> = ({
  equipment,
  selectedEquipment,
  onSelectionChange
}) => {
  const handleEquipmentClick = (equipmentId: string) => {
    const isSelected = selectedEquipment.includes(equipmentId);
    
    if (isSelected) {
      onSelectionChange(selectedEquipment.filter(id => id !== equipmentId));
    } else {
      onSelectionChange([...selectedEquipment, equipmentId]);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width: 320, 
        height: '100vh',
        overflow: 'auto',
        borderRadius: 0
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Manufacturing Equipment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select equipment for batch scheduling
        </Typography>
        <Divider />
      </Box>
      
      <List sx={{ pt: 0 }}>
        {equipment.map((item) => {
          const isSelected = selectedEquipment.includes(item.id);
          
          return (
            <DraggableEquipmentItem
              key={item.id}
              equipment={item}
              isSelected={isSelected}
              onSelect={() => handleEquipmentClick(item.id)}
            />
          );
        })}
      </List>
      
      {selectedEquipment.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
          <Typography variant="body2" color="primary" fontWeight="medium">
            {selectedEquipment.length} equipment selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EquipmentSidebar;