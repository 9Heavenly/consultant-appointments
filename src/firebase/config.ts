import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoyZ1FVir0GxHDu-9FYnWbUTSmxf6RBHM",
  authDomain: "consultant-appointments.firebaseapp.com",
  projectId: "consultant-appointments",
  storageBucket: "consultant-appointments.firebasestorage.app",
  messagingSenderId: "35609881870",
  appId: "1:35609881870:web:9803779c6ab4252ef2bb5f",
  measurementId: "G-BN96PWRDK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 