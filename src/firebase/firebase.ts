// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDODJL2SLMh6ml__G59hY3dH0R5zx0nWmg",
  authDomain: "safecircle-b0983.firebaseapp.com",
  projectId: "safecircle-b0983",
  storageBucket: "safecircle-b0983.firebasestorage.app",
  messagingSenderId: "461771217045",
  appId: "1:461771217045:web:6db387b2bfcc1af85fa39c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
