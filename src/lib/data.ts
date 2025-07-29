
import type { Employee, WorkLocation } from './types';

export const initialEmployees: Employee[] = [
  { id: '1', name: 'Juan Pérez (Guardia)', role: 'Guardia', shiftRate: 400 },
  { id: '2', name: 'Maria García (Guardia)', role: 'Guardia', shiftRate: 400 },
  { id: '3', name: 'Carlos Rodríguez (Supervisor)', role: 'Supervisor', shiftRate: 600 },
  { id: '4', name: 'Ana Martínez (Coordinador)', role: 'Coordinador', shiftRate: 800 },
  { id: '5', name: 'Luis Hernández (Director)', role: 'Dirección', shiftRate: 1200 },
];

export const initialWorkLocations: WorkLocation[] = [
  { id: 'loc1', name: 'Plaza Central' },
  { id: 'loc2', name: 'Corporativo Delta' },
  { id: 'loc3', name: 'Residencial Los Robles' },
  { id: 'loc4', name: 'Hospital General' },
];
