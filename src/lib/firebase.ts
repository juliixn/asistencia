
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY", // <-- COPIA Y PEGA TU API KEY AQUÍ
  authDomain: "attendeasy-7ubec.firebaseapp.com",
  projectId: "attendeasy-7ubec",
  storageBucket: "attendeasy-7ubec.appspot.com",
  messagingSenderId: "514129614820",
  appId: "REPLACE_WITH_YOUR_APP_ID" // <-- COPIA Y PEGA TU APP ID AQUÍ
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// On first run, seed the database with initial data
import { seedInitialData } from './api';
seedInitialData();


export { app, db };
