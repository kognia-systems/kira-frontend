// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-oFXxCdoHxr0CCEesbs8u06Wj3ZBoJz4",
  authDomain: "chatbot-alan.firebaseapp.com",
  projectId: "chatbot-alan",
  storageBucket: "chatbot-alan.firebasestorage.app",
  messagingSenderId: "1067380158244",
  appId: "1:1067380158244:web:ead4ac5d4a8f7cb1564db1",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
