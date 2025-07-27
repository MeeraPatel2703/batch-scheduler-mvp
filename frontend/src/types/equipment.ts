export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  capacity?: number;
  location?: string;
  manufacturer?: string;
  installation_date?: Date | string;
  last_maintenance?: Date | string;
  next_maintenance?: Date | string;
  operating_temp_range?: {
    min: number;
    max: number;
  };
  cleaning_required?: boolean;
}

export enum EquipmentType {
  REACTOR = 'reactor',
  FILTER = 'filter',
  DRYER = 'dryer',
  MIXER = 'mixer',
  PACKAGING = 'packaging',
  CONVEYOR = 'conveyor',
  STORAGE = 'storage'
}

export enum EquipmentStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  IN_USE = 'in_use'
}

