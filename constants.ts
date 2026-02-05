import { Company, UserRole, User } from './types';

export const TANK_CAPACITY = 15000;
export const LOW_FUEL_THRESHOLD = 3000;

export const INITIAL_COMPANIES: Company[] = [
  { id: 'empresa-1', name: 'Empresa 1' },
  { id: 'campo-rico', name: 'Campo Rico' },
  { id: 'fertitex', name: 'Fertitex' }
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Operador Campo', 
    email: 'abast@ecofuel.com', 
    password: '123', 
    role: UserRole.ABASTECEDOR, 
    photoUrl: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=150&h=150&fit=crop'
  },
  { 
    id: 'u2', 
    name: 'Admin Central', 
    email: 'admin@ecofuel.com', 
    password: '123', 
    role: UserRole.ADMINISTRADOR,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
  },
  { 
    id: 'u3', 
    name: 'Gerente Geral', 
    email: 'gerente@ecofuel.com', 
    password: '123', 
    role: UserRole.GERENTE,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop'
  }
];