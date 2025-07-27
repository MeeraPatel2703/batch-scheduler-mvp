import { Batch } from '../types/batch';

export interface ConflictInfo {
  hasConflicts: boolean;
  conflictingBatches: {
    batch: Batch;
    overlap: {
      start: Date;
      end: Date;
    };
  }[];
}

/**
 * Checks if two time ranges overlap
 * Returns true if the ranges overlap, false otherwise
 */
export const timeRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  // Convert to timestamps for easier comparison
  const start1Time = start1.getTime();
  const end1Time = end1.getTime();
  const start2Time = start2.getTime();
  const end2Time = end2.getTime();

  // Two ranges overlap if:
  // - start1 is before end2 AND end1 is after start2
  return start1Time < end2Time && end1Time > start2Time;
};

/**
 * Calculates the overlapping time range between two time periods
 */
export const getOverlapRange = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): { start: Date; end: Date } | null => {
  if (!timeRangesOverlap(start1, end1, start2, end2)) {
    return null;
  }

  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

  return { start: overlapStart, end: overlapEnd };
};

/**
 * Detects scheduling conflicts for a batch on specific equipment
 * 
 * @param equipmentId - The equipment ID to check conflicts for
 * @param startTime - The proposed start time for the batch
 * @param endTime - The proposed end time for the batch
 * @param existingBatches - Array of all existing batches
 * @param excludeBatchId - Optional batch ID to exclude from conflict checking (for editing existing batches)
 * @returns ConflictInfo object with conflict details
 */
export const detectSchedulingConflicts = (
  equipmentId: string,
  startTime: Date,
  endTime: Date,
  existingBatches: Batch[],
  excludeBatchId?: string
): ConflictInfo => {
  // Validate input times
  if (startTime >= endTime) {
    throw new Error('Start time must be before end time');
  }

  // Find batches on the same equipment (excluding the current batch if editing)
  const relevantBatches = existingBatches.filter(batch => 
    batch.equipment_id === equipmentId && 
    batch.id !== excludeBatchId
  );

  const conflictingBatches: ConflictInfo['conflictingBatches'] = [];

  // Check each relevant batch for time conflicts
  for (const batch of relevantBatches) {
    const batchStart = new Date(batch.start_time);
    const batchEnd = new Date(batch.end_time);

    if (timeRangesOverlap(startTime, endTime, batchStart, batchEnd)) {
      const overlap = getOverlapRange(startTime, endTime, batchStart, batchEnd);
      
      if (overlap) {
        conflictingBatches.push({
          batch,
          overlap
        });
      }
    }
  }

  return {
    hasConflicts: conflictingBatches.length > 0,
    conflictingBatches
  };
};

/**
 * Formats a time range for display
 */
export const formatTimeRange = (start: Date, end: Date): string => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  const startStr = start.toLocaleDateString('en-US', formatOptions);
  const endStr = end.toLocaleDateString('en-US', formatOptions);

  // If same day, show simplified format
  if (start.toDateString() === end.toDateString()) {
    const timeOnlyOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    const endTimeStr = end.toLocaleTimeString('en-US', timeOnlyOptions);
    return `${startStr} - ${endTimeStr}`;
  }

  return `${startStr} - ${endStr}`;
};

/**
 * Formats conflict information for display to users
 */
export const formatConflictMessage = (conflictInfo: ConflictInfo): string => {
  if (!conflictInfo.hasConflicts) {
    return '';
  }

  const conflicts = conflictInfo.conflictingBatches;
  const conflictCount = conflicts.length;

  if (conflictCount === 1) {
    const conflict = conflicts[0];
    const timeRange = formatTimeRange(
      new Date(conflict.batch.start_time),
      new Date(conflict.batch.end_time)
    );
    return `Scheduling conflict detected with "${conflict.batch.product_name}" (${timeRange})`;
  }

  return `${conflictCount} scheduling conflicts detected. Please adjust the time or choose different equipment.`;
};