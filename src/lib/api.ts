
'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { Employee, WorkLocation, LoanRequest, AttendanceRecord } from './types';
import { initialData } from './data';

// This is a service account key and is secure to be on the server.
const serviceAccount = {
  "type": "service_account",
  "project_id": "z7fg11l4rn2djh8c9mnjyc09c53cui",
  "private_key_id": "9d9e6e1e6b8c9d0f3e7a1d1e4c9e4c0d1a4b9c1e",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/iY5g7t8i3g1E\nc8g5U6Y8h3g5f1j4d7v6e9g2d3c9h4g8b1g6c4g9e1g6g9c3f4e9h2e1g6g9c3f\n4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3\nf4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e1g6g9c3f4e9h2e\n-\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-7ubec@z7fg11l4rn2djh8c9mnjyc09c53cui.iam.gserviceaccount.com",
  "client_id": "106293814876543210987",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7ubec%40z7fg11l4rn2djh8c9mnjyc09c53cui.iam.gserviceaccount.com"
};

let app: App;
let db: Firestore;

if (!getApps().length) {
    app = initializeApp({
        credential: cert(serviceAccount)
    });
} else {
    app = getApps()[0];
}

db = getFirestore(app);

// --- Data Seeding (for first-time setup) ---
export async function seedInitialData() {
    try {
        const employeesRef = db.collection('employees');
        const employeesSnapshot = await employeesRef.get();
        if (employeesSnapshot.empty) {
            console.log('Seeding database...');
            const batch = db.batch();
            initialData.employees.forEach(employee => {
                const docRef = db.collection('employees').doc(employee.id);
                batch.set(docRef, employee);
            });
            initialData.workLocations.forEach(location => {
                const docRef = db.collection('workLocations').doc(location.id);
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
  const snapshot = await db.collection('employees').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
}

export async function createEmployee(newEmployee: Omit<Employee, 'id'>): Promise<Employee> {
  const docRef = await db.collection('employees').add(newEmployee);
  return { id: docRef.id, ...newEmployee };
}

export async function updateEmployee(updatedEmployee: Partial<Employee> & { id: string }): Promise<Employee> {
  const { id, ...dataToUpdate } = updatedEmployee;
  const employeeRef = db.collection('employees').doc(id);
  await employeeRef.update(dataToUpdate);
  const docSnap = await employeeRef.get();
  return { id: docSnap.id, ...docSnap.data() } as Employee;
}

export async function deleteEmployee(employeeId: string): Promise<string> {
  const employeeRef = db.collection('employees').doc(employeeId);
  await employeeRef.delete();
  return employeeId;
}

// --- WorkLocation API ---
export async function fetchWorkLocations(): Promise<WorkLocation[]> {
    const snapshot = await db.collection('workLocations').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLocation));
}

export async function createWorkLocation(newService: Omit<WorkLocation, 'id'>): Promise<WorkLocation> {
    const docRef = await db.collection('workLocations').add(newService);
    return { id: docRef.id, ...newService };
}

export async function updateWorkLocation(updatedService: WorkLocation): Promise<WorkLocation> {
    const { id, ...dataToUpdate } = updatedService;
    const serviceRef = db.collection('workLocations').doc(id);
    await serviceRef.update(dataToUpdate);
    return updatedService;
}

export async function deleteWorkLocation(serviceId: string): Promise<string> {
    const serviceRef = db.collection('workLocations').doc(serviceId);
    await serviceRef.delete();
    return serviceId;
}

// --- LoanRequest API ---
export async function fetchLoanRequests(): Promise<LoanRequest[]> {
    const snapshot = await db.collection('loanRequests').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanRequest));
}

export async function createLoanRequest(newRequest: Omit<LoanRequest, 'id'>): Promise<LoanRequest> {
    const docRef = await db.collection('loanRequests').add(newRequest);
    return { id: docRef.id, ...newRequest };
}

export async function updateLoanRequest(updatedLoan: Partial<LoanRequest> & { id: string }): Promise<LoanRequest> {
    const { id, ...dataToUpdate } = updatedLoan;
    const loanRef = db.collection('loanRequests').doc(id);
    await loanRef.update(dataToUpdate);
    const docSnap = await loanRef.get();
    return { id: docSnap.id, ...docSnap.data() } as LoanRequest;
}

// --- AttendanceRecord API ---
export async function fetchAttendanceRecords(month?: string | null): Promise<AttendanceRecord[]> {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('attendanceRecords');
    if (month) { // month is in 'YYYY-MM' format
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;
         query = query
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
}

export async function createOrUpdateAttendanceRecord(record: Partial<AttendanceRecord> & { employeeId: string; date: string; shift: 'day' | 'night' }): Promise<AttendanceRecord> {
  const query = db.collection('attendanceRecords')
      .where('employeeId', '==', record.employeeId)
      .where('date', '==', record.date)
      .where('shift', '==', record.shift);

  const querySnapshot = await query.get();
  
  if (!querySnapshot.empty) {
    const existingDoc = querySnapshot.docs[0];
    const docRef = db.collection('attendanceRecords').doc(existingDoc.id);
    await docRef.update(record);
    const updatedDoc = await docRef.get();
    return { ...updatedDoc.data(), id: existingDoc.id } as AttendanceRecord;
  } else {
    const docRef = await db.collection('attendanceRecords').add(record);
    const newDoc = await docRef.get();
    return { id: docRef.id, ...newDoc.data() } as AttendanceRecord;
  }
}
