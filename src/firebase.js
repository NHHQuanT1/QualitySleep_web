require("dotenv").config();
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const { getAuth } = require("firebase-admin/auth");

const firebaseConfig = {
  apiKey: "AIzaSyA0PXrHtVLNX8BplXbT_G2zFwXZ0VUsM4Q",
  authDomain: "testpart1912.firebaseapp.com",
  databaseURL: "https://testpart1912-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testpart1912",
  storageBucket: "testpart1912.firebasestorage.app",
  messagingSenderId: "185524839819",
  appId: "1:185524839819:web:e46cf91540e198aeabbb8e"
};

const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const database = getDatabase(app);
const auth = getAuth(app);

module.exports = {
  db,
  database,
  auth
};
