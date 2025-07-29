export type EmployeeRole = "Guardia" | "Supervisor" | "Coordinador" | "Dirección";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  shiftRate: number;
}

export interface WorkLocation {
  id: string;
  name: string;
}

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

export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  shift: "day" | "night";
  status: AttendanceStatus;
  locationId?: string;
  photoEvidence?: string; // a base64 string or a URL
  notes?: string;
}

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

export interface LoanRequest {
  id: string;
  employeeId: string;
  requestDate: string; // YYYY-MM-DD
  amount: number;
  term: LoanTerm;
  installments: number; // 1 for 'única', 2 or more for 'quincenal'
  reason: string;
  status: LoanStatus;
  approvedBy?: string; // director's id
  approvalDate?: string;
  signature: string; // data-url of signature
}
