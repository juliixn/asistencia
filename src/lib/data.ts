
import type { Employee, WorkLocation, LoanRequest } from './types';

export const initialEmployees: Employee[] = [
  { id: '1', name: 'Juan Pérez (Guardia)', role: 'Guardia', shiftRate: 400, email: 'guardia@test.com' },
  { id: '2', name: 'Maria García (Guardia)', role: 'Guardia', shiftRate: 400, email: 'guardia2@test.com' },
  { id: '3', name: 'Carlos Rodríguez (Supervisor)', role: 'Supervisor', shiftRate: 600, email: 'supervisor@test.com' },
  { id: '4', name: 'Ana Martínez (Coordinador)', role: 'Coordinador', shiftRate: 800, email: 'coordinador@test.com' },
  { id: '5', name: 'Luis Hernández (Director)', role: 'Dirección', shiftRate: 1200, email: 'director@test.com' },
];

export const initialWorkLocations: WorkLocation[] = [
  { id: 'loc1', name: 'Plaza Central' },
  { id: 'loc2', name: 'Corporativo Delta' },
  { id: 'loc3', name: 'Residencial Los Robles' },
  { id: 'loc4', name: 'Hospital General' },
];

export const initialLoans: LoanRequest[] = [
    {
        id: 'loan1',
        employeeId: '1',
        requestDate: '2025-07-10',
        amount: 1000,
        term: 'quincenal',
        installments: 2,
        reason: 'Emergencia médica',
        status: 'Aprobado',
        approvedBy: '5',
        approvalDate: '2025-07-11',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    },
    {
        id: 'loan2',
        employeeId: '2',
        requestDate: '2025-07-20',
        amount: 500,
        term: 'única',
        installments: 1,
        reason: 'Adelanto de nómina',
        status: 'Pendiente',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    }
];
