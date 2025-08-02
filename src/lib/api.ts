
import { initialData } from './data';
import type { Employee, WorkLocation, LoanRequest, AttendanceRecord } from './types';

// This is a mock in-memory DB. In a real app, this would be a database.
let DB = {
  employees: initialData.employees,
  workLocations: initialData.workLocations,
  loanRequests: initialData.loanRequests,
  attendanceRecords: initialData.attendanceRecords,
};

const persistData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('appDB', JSON.stringify(DB));
  }
};

const loadData = () => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('appDB');
    if (data) {
      DB = JSON.parse(data);
    }
  }
};

// Load data once when the app starts
loadData();


// --- Employee API ---
export async function fetchEmployees(): Promise<Employee[]> {
  return [...DB.employees];
}

export async function fetchAllEmployees(): Promise<Employee[]> {
  return [...DB.employees];
}

export async function createEmployee(newEmployee: Omit<Employee, 'id' | 'email'>): Promise<Employee> {
  const email = `${newEmployee.name.split(' ')[0].toLowerCase()}@test.com`;
  const createdEmployee: Employee = { ...newEmployee, id: `emp-${Date.now()}`, email };
  DB.employees.push(createdEmployee);
  persistData();
  return createdEmployee;
}

export async function updateEmployee(updatedEmployee: Partial<Employee> & { id: string }): Promise<Employee> {
  const index = DB.employees.findIndex(e => e.id === updatedEmployee.id);
  if (index === -1) throw new Error("Employee not found");
  const employeeToUpdate = DB.employees[index];
  const newEmployeeData = { ...employeeToUpdate, ...updatedEmployee };
  DB.employees[index] = newEmployeeData;
  persistData();
  return newEmployeeData;
}

export async function deleteEmployee(employeeId: string): Promise<{ id: string }> {
  DB.employees = DB.employees.filter(e => e.id !== employeeId);
  persistData();
  return { id: employeeId };
}


// --- WorkLocation API ---
export async function fetchWorkLocations(): Promise<WorkLocation[]> {
    return [...DB.workLocations];
}

export async function createWorkLocation(newService: Omit<WorkLocation, 'id'>): Promise<WorkLocation> {
    const createdService: WorkLocation = { ...newService, id: `loc-${Date.now()}`};
    DB.workLocations.push(createdService);
    persistData();
    return createdService;
}

export async function updateWorkLocation(updatedService: WorkLocation): Promise<WorkLocation> {
    const index = DB.workLocations.findIndex(s => s.id === updatedService.id);
    if (index === -1) throw new Error("Service not found");
    DB.workLocations[index] = updatedService;
    persistData();
    return updatedService;
}

export async function deleteWorkLocation(serviceId: string): Promise<{ id: string }> {
    DB.workLocations = DB.workLocations.filter(s => s.id !== serviceId);
    persistData();
    return { id: serviceId };
}

// --- LoanRequest API ---
export async function fetchLoanRequests(): Promise<LoanRequest[]> {
    return [...DB.loanRequests];
}

export async function createLoanRequest(newRequest: Omit<LoanRequest, 'id'>): Promise<LoanRequest> {
    const createdLoan: LoanRequest = { ...newRequest, id: `loan-${Date.now()}`};
    DB.loanRequests.push(createdLoan);
    persistData();
    return createdLoan;
}

export async function updateLoanRequest(updatedLoan: Partial<LoanRequest> & { id: string }): Promise<LoanRequest> {
    const index = DB.loanRequests.findIndex(l => l.id === updatedLoan.id);
    if (index === -1) throw new Error("Loan not found");
    const loanToUpdate = DB.loanRequests[index];
    const newLoanData = { ...loanToUpdate, ...updatedLoan };
    DB.loanRequests[index] = newLoanData;
    persistData();
    return newLoanData;
}


// --- AttendanceRecord API ---
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
    return [...DB.attendanceRecords];
}

export async function createOrUpdateAttendanceRecord(record: Partial<AttendanceRecord> & { employeeId: string; date: string; shift: 'day' | 'night' }): Promise<AttendanceRecord> {
  const index = DB.attendanceRecords.findIndex(r => r.employeeId === record.employeeId && r.date === record.date && r.shift === record.shift);
  
  let newRecord: AttendanceRecord;
  if (index > -1) {
    // Update
    const existingRecord = DB.attendanceRecords[index];
    newRecord = { ...existingRecord, ...record };
    DB.attendanceRecords[index] = newRecord;
  } else {
    // Create
    newRecord = { id: `att-${Date.now()}-${Math.random()}`, ...record } as AttendanceRecord;
    DB.attendanceRecords.push(newRecord);
  }
  persistData();
  return newRecord;
}
