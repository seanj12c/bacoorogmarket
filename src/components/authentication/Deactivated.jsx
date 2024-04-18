import React, { useState, useEffect } from "react";
import {
  doc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { firestore } from "../../firebase";
import Swal from "sweetalert2";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import loginbg from "../../assets/loginbg.png";

const Deactivate = () => {
  const [userId, setUserId] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchDeactivateReason = async () => {
      try {
        const docRef = doc(firestore, "accountDeactivateReasons", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDeactivateReason(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching deactivate reason:", error);
      }
    };

    fetchDeactivateReason();
  }, [userId]);

  const handleActivateAccount = async () => {
    // Show confirmation dialog
    Swal.fire({
      title: "Activate Account",
      text: "Are you sure you want to activate your account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, activate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#008080",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Hide recipes
          const recipesQuery = query(
            collection(firestore, "recipes"),
            where("userUid", "==", userId)
          );
          const recipesSnapshot = await getDocs(recipesQuery);
          recipesSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { accountDeactivated: false });
          });

          // Hide products
          const productsQuery = query(
            collection(firestore, "products"),
            where("userUid", "==", userId)
          );
          const productsSnapshot = await getDocs(productsQuery);
          productsSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { accountDeactivated: false });
          });

          // Hide chats
          const chatsQuery = query(
            collection(firestore, "chats"),
            where("messages", "array-contains", { senderId: userId })
          );
          const chatsSnapshot = await getDocs(chatsQuery);
          chatsSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { accountDeactivated: false });
          });

          // Update user's isDeactivated status
          const userRef = doc(firestore, "registered", userId);
          await updateDoc(userRef, { isDeactivated: false });

          // Inform the user and navigate them to the homepage
          Swal.fire({
            title: "Account Activated",
            text: "Your account has been successfully activated. Welcome back!",
            icon: "success",
            showConfirmButton: false,
          }).then(() => {
            navigate("/");
          });
        } catch (error) {
          console.error("Error activating account:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to activate your account. Please try again later.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl text-center font-semibold mb-4">
          Your Account is Deactivated
        </h2>
        {deactivateReason ? (
          <div className="mb-4">
            <p>
              Reason: <strong>{deactivateReason.reason}</strong>
            </p>
            <p>
              Explanation: <strong>{deactivateReason.explanation}</strong>
            </p>
          </div>
        ) : (
          <p>No reason provided for deactivation.</p>
        )}
        <div className="flex flex-col gap-2 justify-between mt-8">
          <button
            className="btn btn-primary text-white"
            onClick={handleActivateAccount}
          >
            Activate Your Account Now
          </button>
          <button className="bg-base btn" onClick={handleLogoutConfirmation}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deactivate;
