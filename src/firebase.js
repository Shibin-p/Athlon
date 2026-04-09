import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBm3atOYCOixVKLc2f0R7GNQyIGEqGy9SU",
  authDomain: "athlon-fa241.firebaseapp.com",
  projectId: "athlon-fa241",
  storageBucket: "athlon-fa241.firebasestorage.app",
  messagingSenderId: "1003557419565",
  appId: "1:1003557419565:web:3218491676b2e4e4f716a4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
