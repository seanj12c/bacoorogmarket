import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence, // Change this to browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUyOGtGwxZsV90FB55P8rRp705zjb2GtA",
  authDomain: "bacoorogmarket.firebaseapp.com",
  databaseURL:
    "https://bacoorogmarket-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bacoorogmarket",
  storageBucket: "bacoorogmarket.appspot.com",
  messagingSenderId: "201952087936",
  appId: "1:201952087936:web:572aa6ac0a4fa62c203b65",
  measurementId: "G-TTYEBJ69J9",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Set persistence to LOCAL for maintaining the user's login state even after closing the browser
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Data will be persisted locally in the browser
    console.log("Auth persistence set successfully");
  })
  .catch((error) => {
    // Handle errors
    console.error("Error setting auth persistence:", error);
  });

export { firestore, auth };
