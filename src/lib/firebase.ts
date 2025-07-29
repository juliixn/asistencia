
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALJNJvgqr7DD8vsEE4x4JwnM82HmPkQtc",
  authDomain: "asistencia-y-nomina.firebaseapp.com",
  projectId: "asistencia-y-nomina",
  storageBucket: "asistencia-y-nomina.appspot.com",
  messagingSenderId: "717198759617",
  appId: "1:717198759617:web:2c6b3e7f7d1a2a4b3e3c1d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
