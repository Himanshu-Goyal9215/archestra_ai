import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAL7PJQF2LmLHfU6IY2HO5QN7es44qH9lE",
    authDomain: "personal-assistant-85a0e.firebaseapp.com",
    projectId: "personal-assistant-85a0e",
    storageBucket: "personal-assistant-85a0e.firebasestorage.app",
    messagingSenderId: "568287775887",
    appId: "1:568287775887:web:8e1647d7fd0bda8e6db4fa",
    measurementId: "G-1LWZPQ72J8",
};

// Initialize Firebase (prevent duplicate init in HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
