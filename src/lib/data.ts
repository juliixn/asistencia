
import type { Employee, WorkLocation } from './types';

// This data is used to seed the database on the first run.
// Passwords should be changed or managed securely in a real application.
const employees: Employee[] = [
  { id: 'dir-001', name: 'Carlos Mendoza', role: 'Director de Seguridad', shiftRate: 1200, email: 'director@guardian.co', password: 'password123' },
  { id: 'coo-001', name: 'Ana Garcia', role: 'Coordinador de Seguridad', shiftRate: 800, email: 'ana.g@guardian.co', password: 'password123' },
  { id: 'sup-001', name: 'Juan Perez', role: 'Supervisor de Seguridad', shiftRate: 600, email: 'juan.p@guardian.co', password: 'password123' },
  { id: 'sup-002', name: 'Maria Rodriguez', role: 'Supervisor de Seguridad', shiftRate: 450, email: 'maria.r@guardian.co', password: 'password123' },
  { id: 'sup-003', name: 'Luis Hernandez', role: 'Supervisor de Seguridad', shiftRate: 450, email: 'luis.h@guardian.co', password: 'password123' },
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
