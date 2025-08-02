
import type { Employee, WorkLocation, LoanRequest, AttendanceRecord } from './types';

const employees: Employee[] = [
  { id: 'emp-1', name: 'Carlos Mendoza', role: 'Director de Seguridad', shiftRate: 1200, email: 'director@test.com', password: 'password123' },
  { id: 'emp-2', name: 'Ana Garcia', role: 'Coordinador de Seguridad', shiftRate: 800, email: 'ana.g@test.com', password: 'password123' },
  { id: 'emp-3', name: 'Juan Perez', role: 'Supervisor de Seguridad', shiftRate: 600, email: 'juan.p@test.com', password: 'password123' },
  { id: 'emp-4', name: 'Maria Rodriguez', role: 'Supervisor de Seguridad', shiftRate: 450, email: 'maria.r@test.com', password: 'password123' },
  { id: 'emp-5', name: 'Luis Hernandez', role: 'Supervisor de Seguridad', shiftRate: 450, email: 'luis.h@test.com', password: 'password123' },
];

const workLocations: WorkLocation[] = [
  { id: 'loc-1', name: 'Corporativo Sigma' },
  { id: 'loc-2', name: 'Plaza Delta' },
  { id: 'loc-3', name: 'Residencial Los Robles' },
  { id: 'loc-4', name: 'Hospital Central' },
];


export const initialData = {
    employees,
    workLocations,
}
