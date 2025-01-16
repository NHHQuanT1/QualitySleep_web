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

// // Sign up function
// const signUp = () => {
//   const email = document.getElementById("typeEmailX").value;
//   const password = document.getElementById("typePasswordX").value;
//   console.log(email, password)
//   // firebase code
//   firebase.auth().createUserWithEmailAndPassword(email, password)
//       .then((result) => {
//           // Signed in 
//           document.write("You are Signed Up")
//           console.log(result)
//           // ...
//       })
//       .catch((error) => {
//           console.log(error.code);
//           console.log(error.message)
//           // ..
//       });
// }

// // Sign In function
// const signIn = () => {
//   const email = document.getElementById("typeEmailX").value;
//   const password = document.getElementById("typePasswordX").value;
//   // firebase code
//   firebase.auth().signInWithEmailAndPassword(email, password)
//       .then((result) => {
//           // Signed in 
//           document.write("You are Signed In")
//           console.log(result)
//       })
//       .catch((error) => {
//           console.log(error.code);
//           console.log(error.message)
//       });
// }


module.exports = {
  db,
  database,
  auth
};



// Lấy tất cả dữ liệu ở Realtime database Firebase
// const data = database.ref("mpuData");

// Lọc và lấy dữ liệu theo khoảng timestamp
// data.orderByChild('data/timestamp').startAt(1735065300).endAt(1735065530).on('value', (snapshot) => {
//   const values = snapshot.val();
//   if (values) {
//     // Lặp qua các key và in giá trị tương ứng
//     Object.keys(values).forEach((key) => {
//       console.log(`Data at ${key}:`, values[key]);
//     });
//   } else {
//     console.log("No data available in the specified timestamp range.");
//   }
// }, error => {
//   console.log("Error fetching data:", error);
// });






