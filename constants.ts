
import { Company, UserRole, User } from './types';

export const TANK_CAPACITY = 15000;
export const LOW_FUEL_THRESHOLD = 3000;

export const INITIAL_COMPANIES: Company[] = [
  { id: 'campo-rico', name: 'Campo Rico' },
  { id: 'km-12', name: 'KM-12' },
  { id: 'km-04', name: 'KM-04' },
  { id: 'porto-cdp', name: 'Porto CDP' },
  { id: 'porto-prainha', name: 'Porto Prainha' }
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Carlos Silva', 
    email: 'carlos@ecofuel.com', 
    password: '123', 
    role: UserRole.ABASTECEDOR, 
    companyId: 'campo-rico',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  },
  { 
    id: 'u2', 
    name: 'Ana Mendes', 
    email: 'admin@ecofuel.com', 
    password: '123', 
    role: UserRole.ADMINISTRADOR,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  { 
    id: 'u3', 
    name: 'Marcos Oliveira', 
    email: 'gerente@ecofuel.com', 
    password: '123', 
    role: UserRole.GERENTE,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
  }
];
