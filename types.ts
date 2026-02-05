
export enum UserRole {
  ABASTECEDOR = 'ABASTECEDOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE = 'GERENTE'
}

export type MachineType = 'MAQUINA' | 'VEICULO';

export interface Company {
  id: string;
  name: string;
  synced?: boolean;
}

export interface Machine {
  id: string;
  name: string;
  companyId: string;
  type: MachineType;
  plate?: string;
  photoUrl?: string;
  synced?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  companyId?: string;
  photoUrl?: string;
  synced?: boolean;
}

export interface Fueling {
  id: string;
  date: string;
  machineId: string;
  companyId: string;
  liters: number;
  meter?: number;
  operatorName: string;
  photoUrl?: string;
  observations?: string;
  userId: string;
  correctionNote?: string;
  synced?: boolean;
}

export interface TankRefill {
  id: string;
  date: string;
  companyId: string;
  liters: number;
  userId: string;
  synced?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ADJUST' | 'USER_EDIT' | 'USER_DELETE';
  entity: 'FUELING' | 'REFILL' | 'MACHINE' | 'USER' | 'TANK';
  oldValue?: string;
  newValue?: string;
  reason: string;
  synced?: boolean;
}

export interface TankStatus {
  name: string;
  capacity: number;
  currentLevel: number;
  synced?: boolean;
}
