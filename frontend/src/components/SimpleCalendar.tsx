import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Drop zone setup - simplified approach
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'equipment',
    drop: (item: { equipment: Equipment }, monitor) => {
      console.log('Equipment dropped:', item.equipment.name);
      
      // If we have a selected time slot, open dialog immediately
      if (selectedTimeSlot && onCreateBatch) {
        onCreateBatch(item.equipment, selectedTimeSlot.start, selectedTimeSlot.end);
        setSelectedTimeSlot(null);
      } else {
        // Show alert to user about selecting time first
        alert('Please select a time slot on the calendar first, then drag equipment to that area.');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // This is no longer needed as we're using the new dialog system

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
    console.log('Selected time range:', {
      start: start.toISOString(),
      end: end.toISOString(),
      duration: `${(end - start) / (1000 * 60 * 60)} hours`
    });
    
    // Store the selected time slot for drag and drop
    setSelectedTimeSlot({ start, end });
    
    // Keep the selection visible and provide user feedback
    console.log('Time slot selected! Now drag equipment from the sidebar to create a batch.');
    
    // Don't automatically clear - let user control it
    // Clear after 10 seconds to allow for drag and drop
    setTimeout(() => {
      selectInfo.view.calendar.unselect();
      setSelectedTimeSlot(null);
    }, 10000); // 10 seconds to allow drag and drop
  };

  // Handle clicking on existing batch events
  const handleEventClick = (clickInfo: any) => {
    const { batch } = clickInfo.event.extendedProps;
    console.log('Clicked batch event:', batch);
    
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
      {/* Instructions for drag and drop */}
      {selectedTimeSlot && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ✅ Time slot selected! Now drag equipment from the sidebar to create a batch.
          </Typography>
        </Alert>
      )}
      
      {!selectedTimeSlot && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📅 Click and drag on the calendar to select a time slot, then drag equipment here.
          </Typography>
        </Alert>
      )}
      
      <Box 
        ref={drop}
        sx={{ 
          height: 'calc(100vh - 180px)',
          backgroundColor: isOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
          transition: 'background-color 0.2s ease',
          border: selectedTimeSlot ? '2px dashed #1976d2' : isOver ? '2px dashed #ff9800' : '1px solid transparent',
          borderRadius: 1,
          position: 'relative'
        }}
      >
        {isOver && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              backgroundColor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              pointerEvents: 'none'
            }}
          >
            <Typography variant="h6">
              Drop here to create batch!
            </Typography>
          </Box>
        )}
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