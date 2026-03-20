import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr7-FlZZ6Z3RMuAIt34jt_03oP6mGYH8k",
  authDomain: "rozirakshak-ai.firebaseapp.com",
  projectId: "rozirakshak-ai",
  storageBucket: "rozirakshak-ai.firebasestorage.app",
  messagingSenderId: "1004603597178",
  appId: "1:1004603597178:web:b119e25e57275b302a36c3",
  measurementId: "G-LTJ8LVLLNL",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
