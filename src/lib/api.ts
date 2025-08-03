
import { db } from './firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    writeBatch,
    getDoc
} from 'firebase/firestore';
import type { Employee, WorkLocation, LoanRequest, AttendanceRecord } from './types';
import { initialData } from './data';

// --- Data Seeding (for first-time setup) ---
export async function seedInitialData() {
    try {
        const employeesRef = collection(db, 'employees');
        const employeesSnapshot = await getDocs(employeesRef);
        if (employeesSnapshot.empty) {
            console.log('Seeding database...');
            const batch = writeBatch(db);
            initialData.employees.forEach(employee => {
                const docRef = doc(db, 'employees', employee.id);
                batch.set(docRef, employee);
            });
            initialData.workLocations.forEach(location => {
                const docRef = doc(db, 'workLocations', location.id);
                batch.set(docRef, location);
            });
            await batch.commit();
            console.log('Database seeded successfully.');
        }
    } catch (error) {
        console.error("Error seeding database: ", error);
    }
}

// --- Employee API ---
export async function fetchEmployees(): Promise<Employee[]> {
  const q = query(collection(db, 'employees'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
}

export async function createEmployee(newEmployee: Omit<Employee, 'id'>): Promise<Employee> {
  const docRef = await addDoc(collection(db, 'employees'), newEmployee);
  return { id: docRef.id, ...newEmployee };
}

export async function updateEmployee(updatedEmployee: Partial<Employee> & { id: string }): Promise<Employee> {
  const { id, ...dataToUpdate } = updatedEmployee;
  const employeeRef = doc(db, 'employees', id);
  await updateDoc(employeeRef, dataToUpdate);
  const docSnap = await getDoc(employeeRef);
  return { id: docSnap.id, ...docSnap.data() } as Employee;
}

export async function deleteEmployee(employeeId: string): Promise<string> {
  const employeeRef = doc(db, 'employees', employeeId);
  await deleteDoc(employeeRef);
  return employeeId;
}

// --- WorkLocation API ---
export async function fetchWorkLocations(): Promise<WorkLocation[]> {
    const q = query(collection(db, 'workLocations'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLocation));
}

export async function createWorkLocation(newService: Omit<WorkLocation, 'id'>): Promise<WorkLocation> {
    const docRef = await addDoc(collection(db, 'workLocations'), newService);
    return { id: docRef.id, ...newService };
}

export async function updateWorkLocation(updatedService: WorkLocation): Promise<WorkLocation> {
    const { id, ...dataToUpdate } = updatedService;
    const serviceRef = doc(db, 'workLocations', id);
    await updateDoc(serviceRef, dataToUpdate);
    return updatedService;
}

export async function deleteWorkLocation(serviceId: string): Promise<string> {
    const serviceRef = doc(db, 'workLocations', serviceId);
    await deleteDoc(serviceRef);
    return serviceId;
}

// --- LoanRequest API ---
export async function fetchLoanRequests(): Promise<LoanRequest[]> {
    const q = query(collection(db, 'loanRequests'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanRequest));
}

export async function createLoanRequest(newRequest: Omit<LoanRequest, 'id'>): Promise<LoanRequest> {
    const docRef = await addDoc(collection(db, 'loanRequests'), newRequest);
    return { id: docRef.id, ...newRequest };
}

export async function updateLoanRequest(updatedLoan: Partial<LoanRequest> & { id: string }): Promise<LoanRequest> {
    const { id, ...dataToUpdate } = updatedLoan;
    const loanRef = doc(db, 'loanRequests', id);
    await updateDoc(loanRef, dataToUpdate);
    const docSnap = await getDoc(loanRef);
    return { id: docSnap.id, ...docSnap.data() } as LoanRequest;
}

// --- AttendanceRecord API ---
export async function fetchAttendanceRecords(month?: string | null): Promise<AttendanceRecord[]> {
    let q;
    if (month) { // month is in 'YYYY-MM' format
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;
         q = query(
            collection(db, 'attendanceRecords'), 
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );
    } else {
        q = query(collection(db, 'attendanceRecords'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function createOrUpdateAttendanceRecord(record: Partial<AttendanceRecord> & { employeeId: string; date: string; shift: 'day' | 'night' }): Promise<AttendanceRecord> {
  const q = query(
      collection(db, 'attendanceRecords'), 
      where('employeeId', '==', record.employeeId), 
      where('date', '==', record.date), 
      where('shift', '==', record.shift)
  );

  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const existingDoc = querySnapshot.docs[0];
    const docRef = doc(db, 'attendanceRecords', existingDoc.id);
    await updateDoc(docRef, record);
    return { ...existingDoc.data(), ...record, id: existingDoc.id } as AttendanceRecord;
  } else {
    const docRef = await addDoc(collection(db, 'attendanceRecords'), record);
    return { id: docRef.id, ...record } as AttendanceRecord;
  }
}
