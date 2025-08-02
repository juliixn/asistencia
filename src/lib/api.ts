
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
    documentId 
} from 'firebase/firestore';
import type { Employee, WorkLocation, LoanRequest, AttendanceRecord, EmployeeRole } from './types';
import { initialData } from './data';

// --- Data Seeding ---
async function seedCollection(collectionName: string, data: any[]) {
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        if (snapshot.empty) {
            console.log(`Seeding ${collectionName}...`);
            for (const item of data) {
                // We specify the ID here to maintain consistency from initialData
                const docRef = doc(db, collectionName, item.id);
                await addDoc(collection(db, collectionName), item);
            }
        }
    } catch (error) {
        console.error(`Error seeding ${collectionName}:`, error);
    }
}

export async function seedInitialData() {
    await seedCollection('employees', initialData.employees);
    await seedCollection('workLocations', initialData.workLocations);
}


// --- Employee API ---
export async function fetchEmployees(): Promise<Employee[]> {
  const q = query(collection(db, 'employees'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
}

// Used by auth context to get all employee data including passwords
export async function fetchAllEmployees(): Promise<Employee[]> {
  const q = query(collection(db, 'employees'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
}

export async function createEmployee(newEmployee: Omit<Employee, 'id' | 'email'>): Promise<Employee> {
  const email = `${newEmployee.name.split(' ')[0].toLowerCase()}@test.com`;
  const employeeData = { ...newEmployee, email };
  const docRef = await addDoc(collection(db, 'employees'), employeeData);
  return { id: docRef.id, ...employeeData };
}

export async function updateEmployee(updatedEmployee: Partial<Employee> & { id: string }): Promise<Employee> {
  const { id, ...dataToUpdate } = updatedEmployee;
  const employeeRef = doc(db, 'employees', id);
  await updateDoc(employeeRef, dataToUpdate);
  return updatedEmployee as Employee;
}

export async function deleteEmployee(employeeId: string): Promise<{ id: string }> {
  const employeeRef = doc(db, 'employees', employeeId);
  await deleteDoc(employeeRef);
  return { id: employeeId };
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

export async function deleteWorkLocation(serviceId: string): Promise<{ id: string }> {
    const serviceRef = doc(db, 'workLocations', serviceId);
    await deleteDoc(serviceRef);
    return { id: serviceId };
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
    return { ...(await getDocs(doc(db, 'loanRequests', id))).data(), id } as LoanRequest;
}


// --- AttendanceRecord API ---
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
    const q = query(collection(db, 'attendanceRecords'));
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
    // Update existing record
    const existingDoc = querySnapshot.docs[0];
    const docRef = doc(db, 'attendanceRecords', existingDoc.id);
    await updateDoc(docRef, record);
    return { id: existingDoc.id, ...existingDoc.data(), ...record } as AttendanceRecord;
  } else {
    // Create new record
    const docRef = await addDoc(collection(db, 'attendanceRecords'), record);
    return { id: docRef.id, ...record } as AttendanceRecord;
  }
}
