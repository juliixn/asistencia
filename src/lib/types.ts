
export type EmployeeRole = "Guardia" | "Supervisor de Seguridad" | "Coordinador de Seguridad" | "Director de Seguridad";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  shiftRate: number;
  email: string;
  password?: string; // Add password field
}

export interface WorkLocation {
    id: string;
    name: string;
}

export type LoanStatus = "Pendiente" | "Aprobado" | "Rechazado" | "Pagado";
export type LoanTerm = "única" | "quincenal";

export interface LoanRequest {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  term: LoanTerm;
  installments: number;
  status: LoanStatus;
  requestDate: string; // YYYY-MM-DD
  approvalDate: string | null; // YYYY-MM-DD
  approvedById: string | null;
  signature: string; // Data URL of the signature image
}


export type AttendanceStatus = 
  | "Asistencia"
  | "Retardo"
  | "Falta"
  | "Descanso"
  | "Incapacidad"
  | "Vacaciones"
  | "Enfermedad"
  | "PermisoCS" // Con Sueldo
  | "PermisoSS"; // Sin Sueldo

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    shift: 'day' | 'night';
    status: AttendanceStatus;
    locationId: string | null;
    notes: string | null;
    photoEvidence: string | null; // URL or data URL of the photo
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

export interface PayrollDetail {
    employeeId: string;
    employeeName: string;
    shiftsWorked: number;
    lateArrivals: number;
    basePay: number;
    loanDeductions: number;
    penalties: number;
    bonuses: number;
    netPay: number;
}
