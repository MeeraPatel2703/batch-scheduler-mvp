// Import types for utility interfaces
import type { Equipment } from './equipment';
import type { Batch } from './batch';
import { EquipmentType } from './equipment';
import { BatchStatus } from './batch';

// Equipment types
export type { Equipment } from './equipment';
export { EquipmentType, EquipmentStatus } from './equipment';

// Batch types
export type { 
  Batch, 
  BatchSchedule, 
  CreateBatchRequest, 
  UpdateBatchRequest 
} from './batch';
export { BatchStatus, BatchPriority } from './batch';

// Mock data
export {
  MOCK_EQUIPMENT,
  MOCK_BATCHES,
  MOCK_EQUIPMENT_SCHEDULES,
  MOCK_PRODUCTS,
  MOCK_OPERATORS,
  MOCK_RECIPES
} from '../data/mockData';

// Utility types for the application
export interface ScheduleView {
  date: string;
  equipment: Equipment[];
  batches: Batch[];
}

export interface FilterOptions {
  equipment_types?: EquipmentType[];
  batch_statuses?: BatchStatus[];
  date_range?: {
    start: Date | string;
    end: Date | string;
  };
  operators?: string[];
}

export interface ScheduleConflict {
  batch_id: string;
  equipment_id: string;
  conflict_type: 'overlap' | 'maintenance' | 'unavailable';
  message: string;
}