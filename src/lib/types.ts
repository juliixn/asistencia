
import type { 
    Employees, 
    WorkLocations,
    LoanRequests,
    AttendanceRecords
} from '@/dataconnect/types';

export type EmployeeRole = "Guardia" | "Supervisor" | "Coordinador" | "Dirección";

export type Employee = Employees;
export type WorkLocation = WorkLocations;
export type LoanRequest = LoanRequests;
export type AttendanceRecord = AttendanceRecords;


export type AttendanceStatus = 
  | "Asistencia"
  | "Retardo"
  | "Falta"
  | "Descanso"
  | "Incapacidad"
  | "Vacaciones"
  | "Enfermedad"
  | "Permiso C/S" // Con Sueldo
  | "Permiso S/S"; // Sin Sueldo

export type PayrollPeriod = "1-15" | "16-end";

export interface PayrollDeduction {
  id: string;
  amount: number;
  description: string;
}

export interface PayrollBonus {
  id: string;
  amount: number;
  description: string;
}

export type LoanStatus = "Pendiente" | "Aprobado" | "Rechazado" | "Pagado";
export type LoanTerm = "única" | "quincenal";
