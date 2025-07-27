import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { MOCK_EQUIPMENT, Equipment } from '../types';

interface DashboardProps {
  selectedEquipment: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ selectedEquipment }) => {
  const selectedEquipmentData = MOCK_EQUIPMENT.filter((eq: Equipment) => 
    selectedEquipment.includes(eq.id)
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to the Batch Scheduler application! This will replace your Excel spreadsheets with a modern, efficient scheduling system.
      </Typography>

      {selectedEquipment.length > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Selected Equipment ({selectedEquipment.length})
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 2 
            }}
          >
            {selectedEquipmentData.map((equipment: Equipment) => (
              <Card variant="outlined" key={equipment.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {equipment.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={equipment.type} size="small" variant="outlined" />
                    <Chip 
                      label={equipment.status} 
                      size="small" 
                      color={
                        equipment.status === 'active' ? 'success' :
                        equipment.status === 'in_use' ? 'warning' :
                        equipment.status === 'maintenance' ? 'error' : 'default'
                      }
                    />
                  </Box>
                  {equipment.capacity && (
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {equipment.capacity}L
                    </Typography>
                  )}
                  {equipment.location && (
                    <Typography variant="body2" color="text.secondary">
                      Location: {equipment.location}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ) : (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Equipment Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select equipment from the sidebar to begin batch scheduling
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;