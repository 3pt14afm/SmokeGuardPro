
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA9EqRoDuC5jw5BkgEEgA7E_aeoBK8ND0A",
  authDomain: "smokeguardpro.firebaseapp.com",
  databaseURL: 'https://smokeguardpro-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'smokeguardpro',
storageBucket: "smokeguardpro.firebasestorage.app",
  messagingSenderId: "1086366085982",
  appId: "1:1086366085982:web:9ecf4ddf33d38be6b955cf",
  measurementId: "G-NVFXGQSRJT"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);