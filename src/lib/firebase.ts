
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual configuration
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "attendeasy-7ubec.firebaseapp.com",
  projectId: "attendeasy-7ubec",
  storageBucket: "attendeasy-7ubec.appspot.com",
  messagingSenderId: "514129614820",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { app, db };
