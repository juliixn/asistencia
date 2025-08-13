
import type { Employee, WorkLocation } from './types';

// This data is used to seed the database on the first run.
const employees: Omit<Employee, 'email'>[] = [
  { id: 'dir-001', name: 'Carlos Mendoza', role: 'Director de Seguridad', shiftRate: 1200 },
  { id: 'coo-001', name: 'Ana Garcia', role: 'Coordinador de Seguridad', shiftRate: 800 },
  { id: 'sup-001', name: 'Juan Perez', role: 'Supervisor de Seguridad', shiftRate: 600 },
  { id: 'sup-002', name: 'Maria Rodriguez', role: 'Supervisor de Seguridad', shiftRate: 450 },
  { id: 'sup-003', name: 'Luis Hernandez', role: 'Supervisor de Seguridad', shiftRate: 450 },
  { id: 'gua-001', name: 'Pedro Ramirez', role: 'Guardia', shiftRate: 350 },
  { id: 'gua-002', name: 'Sofia Torres', role: 'Guardia', shiftRate: 350 },
  { id: 'gua-003', name: 'Jorge Jimenez', role: 'Guardia', shiftRate: 350 },
];

const workLocations: WorkLocation[] = [
  { id: 'loc-1', name: 'Corporativo Sigma' },
  { id: 'loc-2', name: 'Plaza Delta' },
  { id: 'loc-3', name: 'Residencial Los Robles' },
  { id: 'loc-4', name: 'Hospital Central' },
];

const employeesWithEmail = employees.map(e => ({
    ...e,
    email: `${e.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@example.local`
}));


export const initialData = {
    employees: employeesWithEmail,
    workLocations,
}
