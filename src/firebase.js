import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
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

const getUserProfile = async (userId) => {
  try {
    const userRef = doc(firestore, "registered", userId); // Assuming your collection is named "users"
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data(); // Return user profile data if user exists
    } else {
      return null; // Return null if user doesn't exist
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
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

export { firestore, auth, getUserProfile };
