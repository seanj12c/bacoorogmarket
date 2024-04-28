import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

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
    const userRef = doc(firestore, "registered", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set successfully");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export { firestore, auth, storage, getUserProfile };
