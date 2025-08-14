
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_0r7kwvaJIltlYU933gctdFmdxvtDJGE",
  authDomain: "z7fg11l4rn2djh8c9mnjyc09c53cui.firebaseapp.com",
  projectId: "z7fg11l4rn2djh8c9mnjyc09c53cui",
  storageBucket: "z7fg11l4rn2djh8c9mnjyc09c53cui.firebasestorage.app",
  messagingSenderId: "167620367827",
  appId: "1:167620367827:web:5d58cbc4e67b55372b8b26"
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
