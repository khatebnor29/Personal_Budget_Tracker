// src/Firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB6anWJaGjT6g_hqi3ti7t3NMKoNdpMzMQ",
  authDomain: "personal-budget-tracker-9dca5.firebaseapp.com",
  databaseURL: "https://personal-budget-tracker-9dca5-default-rtdb.firebaseio.com",
  projectId: "personal-budget-tracker-9dca5",
  storageBucket: "personal-budget-tracker-9dca5.appspot.com",
  messagingSenderId: "1049001165395",
  appId: "1:1049001165395:web:f6912e3996d7c77db63ca6",
  measurementId: "G-MYFXRDYY8F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
