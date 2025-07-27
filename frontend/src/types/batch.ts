export interface Batch {
  id: string;
  equipment_id: string;
  product_name: string;
  start_time: Date | string;
  end_time: Date | string;
  status: BatchStatus;
  priority?: BatchPriority;
  batch_size?: number;
  operator?: string;
  recipe_id?: string;
  notes?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export enum BatchStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum BatchPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface BatchSchedule {
  date: string;
  batches: Batch[];
}

export interface CreateBatchRequest {
  equipment_id: string;
  product_name: string;
  start_time: Date | string;
  end_time: Date | string;
  batch_size?: number;
  priority?: BatchPriority;
  operator?: string;
  recipe_id?: string;
  notes?: string;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  id: string;
  status?: BatchStatus;
}