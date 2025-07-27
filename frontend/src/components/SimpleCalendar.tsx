import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { Batch, Equipment, BatchStatus } from '../types';

interface SimpleCalendarProps {
  batches: Batch[];
  equipment: Equipment[];
  selectedEquipment: string[];
  onCreateBatch?: (equipment?: Equipment, startTime?: Date, endTime?: Date) => void;
  onEditBatch?: (batch: Batch) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    batch: Batch;
    equipment: Equipment | undefined;
  };
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  batches,
  equipment,
  selectedEquipment,
  onCreateBatch,
  onEditBatch
}) => {
  // Color mapping for batch statuses
  const getStatusColor = (status: BatchStatus) => {
    switch (status) {
      case BatchStatus.SCHEDULED:
        return { background: '#2196f3', border: '#1976d2' }; // Blue
      case BatchStatus.IN_PROGRESS:
        return { background: '#ff9800', border: '#f57c00' }; // Orange
      case BatchStatus.COMPLETED:
        return { background: '#4caf50', border: '#388e3c' }; // Green
      case BatchStatus.CANCELLED:
        return { background: '#f44336', border: '#d32f2f' }; // Red
      case BatchStatus.ON_HOLD:
        return { background: '#9e9e9e', border: '#616161' }; // Gray
      default:
        return { background: '#607d8b', border: '#455a64' }; // Blue Gray
    }
  };

  // Convert batch data to calendar events
  const convertBatchesToEvents = (): CalendarEvent[] => {
    return batches
      .filter(batch => {
        // Filter batches based on selected equipment
        if (selectedEquipment.length === 0) return true;
        return selectedEquipment.includes(batch.equipment_id);
      })
      .map(batch => {
        const equipmentItem = equipment.find(eq => eq.id === batch.equipment_id);
        const colors = getStatusColor(batch.status);
        
        return {
          id: batch.id,
          title: `${batch.product_name} (${equipmentItem?.name || 'Unknown Equipment'})`,
          start: batch.start_time,
          end: batch.end_time,
          backgroundColor: colors.background,
          borderColor: colors.border,
          extendedProps: {
            batch,
            equipment: equipmentItem
          }
        };
      });
  };

  // Handle clicking on time slots (for creating new batches)
  const handleDateSelect = (selectInfo: any) => {
    const { start, end } = selectInfo;
    
    // Clear selection immediately to prevent visual clutter
    selectInfo.view.calendar.unselect();
    
    // Open create batch dialog with pre-filled times
    if (onCreateBatch) {
      onCreateBatch(undefined, start, end);
    }
  };

  // Handle clicking on existing batch events
  const handleEventClick = (clickInfo: any) => {
    const { batch } = clickInfo.event.extendedProps;
    
    if (onEditBatch) {
      onEditBatch(batch);
    }
  };

  // Handle event drag and resize (optional)
  const handleEventChange = (changeInfo: any) => {
    const { batch } = changeInfo.event.extendedProps;
    console.log('Batch time changed:', {
      batchId: batch.id,
      newStart: changeInfo.event.start?.toISOString(),
      newEnd: changeInfo.event.end?.toISOString()
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          📅 Click and drag on the calendar to create a new batch
        </Typography>
      </Alert>
      
      <Box sx={{ height: 'calc(100vh - 180px)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          height="100%"
          events={convertBatchesToEvents()}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          selectAllow={(selectInfo) => {
            // Allow selection only in the future or today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectInfo.start >= today;
          }}
          businessHours={{
            // Define business hours
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '06:00',
            endTime: '20:00'
          }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short'
          }}
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </Box>
    </Paper>
  );
};

export default SimpleCalendar;