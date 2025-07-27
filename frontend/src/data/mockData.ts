import { Batch, BatchStatus, BatchPriority } from '../types/batch';
import { Equipment, EquipmentType, EquipmentStatus } from '../types/equipment';

// Mock Equipment Data (3 items as requested)
export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-001',
    name: 'Reactor R-101',
    type: EquipmentType.REACTOR,
    status: EquipmentStatus.ACTIVE,
    capacity: 1000,
    location: 'Production Floor A',
    manufacturer: 'ChemTech Industries',
    installation_date: '2020-03-15',
    last_maintenance: '2024-06-01',
    next_maintenance: '2024-09-01',
    operating_temp_range: { min: 80, max: 180 },
    cleaning_required: false
  },
  {
    id: 'eq-002',
    name: 'Filter F-201',
    type: EquipmentType.FILTER,
    status: EquipmentStatus.MAINTENANCE,
    capacity: 800,
    location: 'Production Floor B',
    manufacturer: 'FiltroMax Corp',
    installation_date: '2019-11-20',
    last_maintenance: '2024-07-10',
    next_maintenance: '2024-08-10',
    operating_temp_range: { min: 20, max: 60 },
    cleaning_required: true
  },
  {
    id: 'eq-003',
    name: 'Dryer D-301',
    type: EquipmentType.DRYER,
    status: EquipmentStatus.ACTIVE,
    capacity: 500,
    location: 'Production Floor C',
    manufacturer: 'DryTech Solutions',
    installation_date: '2021-08-10',
    last_maintenance: '2024-05-15',
    next_maintenance: '2024-11-15',
    operating_temp_range: { min: 60, max: 120 },
    cleaning_required: false
  }
];

// Mock Batch Data (2 items as requested)
export const MOCK_BATCHES: Batch[] = [
  {
    id: 'batch-001',
    equipment_id: 'eq-001',
    product_name: 'Pharmaceutical Compound XR-25',
    start_time: '2024-07-24T08:00:00Z',
    end_time: '2024-07-24T16:00:00Z',
    status: BatchStatus.SCHEDULED,
    priority: BatchPriority.HIGH,
    batch_size: 850,
    operator: 'Sarah Johnson',
    recipe_id: 'recipe-pharma-001',
    notes: 'Temperature critical - monitor closely during heating phase',
    created_at: '2024-07-23T14:30:00Z',
    updated_at: '2024-07-23T14:30:00Z'
  },
  {
    id: 'batch-002',
    equipment_id: 'eq-003',
    product_name: 'Industrial Polymer P-402',
    start_time: '2024-07-24T06:00:00Z',
    end_time: '2024-07-24T14:00:00Z',
    status: BatchStatus.IN_PROGRESS,
    priority: BatchPriority.NORMAL,
    batch_size: 450,
    operator: 'Mike Chen',
    recipe_id: 'recipe-polymer-012',
    notes: 'Standard drying cycle - moisture content target <0.5%',
    created_at: '2024-07-23T10:15:00Z',
    updated_at: '2024-07-24T06:00:00Z'
  }
];

export const MOCK_EQUIPMENT_SCHEDULES = {
  'eq-001': ['batch-001'],
  'eq-002': [], // Equipment in maintenance
  'eq-003': ['batch-002']
};

export const MOCK_PRODUCTS = [
  'Pharmaceutical Compound XR-25',
  'Industrial Polymer P-402',
  'Specialty Chemical SC-789',
  'Food Grade Additive FG-156',
  'Coating Material CM-301'
];

export const MOCK_OPERATORS = [
  'Sarah Johnson',
  'Mike Chen',
  'Emma Rodriguez',
  'David Park',
  'Lisa Wang'
];

export const MOCK_RECIPES = [
  { id: 'recipe-pharma-001', name: 'XR-25 Standard Process', duration_hours: 8 },
  { id: 'recipe-polymer-012', name: 'P-402 Drying Cycle', duration_hours: 8 },
  { id: 'recipe-specialty-045', name: 'SC-789 Express Process', duration_hours: 9 }
];