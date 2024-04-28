import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import check from "../../assets/check.gif";
import loginbg from "../../assets/loginbg.png";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import {
  doc,
  getDoc,
  getFirestore,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const DeletionConfirmation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        console.log("User ID:", userId);

        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched data:", data);
          } else {
            console.log("No such document for this user!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
          setError("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user is authenticated.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const handleCancel = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to cancel the deletion of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel the deletion",
      cancelButtonText: "No, keep deleting",
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (isConfirmed) {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId);

        try {
          await updateDoc(userDocRef, {
            deleteAccount: false,
          });
          Swal.fire({
            title: "Account Deletion Canceled",
            text: "Your account deletion has been successfully canceled.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          navigate("/");
          console.log("Account deletion canceled successfully.");
        } catch (error) {
          console.error("Error canceling account deletion:", error);
          setError("Failed to cancel account deletion");
        }
      }
    }
  };

  const handleDelete = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const db = getFirestore();

      const { value: confirmation } = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to delete your account completely. This action cannot be undone.",
        input: "text",
        inputPlaceholder: 'Type "Delete" to confirm',
        inputValidator: (value) => {
          if (value !== "Delete") {
            return 'You need to type "Delete" to confirm';
          }
        },
        showCancelButton: true,
        confirmButtonText: "Delete my Account",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
        icon: "warning",
        dangerMode: true,
      });

      if (confirmation === "Delete") {
        try {
          const recipesQuery = query(
            collection(db, "recipes"),
            where("userUid", "==", userId)
          );
          const recipesSnapshot = await getDocs(recipesQuery);
          recipesSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { isDeleted: true });
          });

          const productsQuery = query(
            collection(db, "products"),
            where("userUid", "==", userId)
          );
          const productsSnapshot = await getDocs(productsQuery);
          productsSnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, { isDeleted: true });
          });

          const appealsQuery = query(
            collection(db, "userAppeal"),
            where("userId", "==", userId)
          );
          const appealsSnapshot = await getDocs(appealsQuery);
          appealsSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });

          const appealsPostQuery = query(
            collection(db, "postAppeal"),
            where("userId", "==", userId)
          );
          const appealsPostSnapshot = await getDocs(appealsPostQuery);
          appealsPostSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });

          const registeredDocRef = doc(db, "registered", userId);
          await updateDoc(registeredDocRef, {
            isDeleted: true,
            deleteAccount: false,
          });
          console.log(
            "Data associated with the user marked as deleted successfully."
          );

          Swal.fire({
            title: "Account Deleted",
            text: "Your account has been deleted. Thank you for using our app.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            auth
              .signOut()
              .then(() => {
                console.log("User logged out.");
                navigate("/");
              })
              .catch((error) => {
                console.error("Error logging out:", error);
                setError("Failed to log out");
              });
          });
        } catch (error) {
          console.error("Error marking user data as deleted:", error);
          setError("Failed to mark user data as deleted");
        }
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid items-center justify-center h-screen">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="bg-white rounded-lg shadow-lg p-6  mx-2 max-w-md">
        <div className="flex justify-center">
          <img src={check} alt="" className="w-20 object-contain " />
        </div>
        <p className="text-center text-lg mb-4">
          Your deletion request has been successfully confirmed.
        </p>
        <div className="flex flex-col text-xs w-full gap-2 md:gap-1 justify-center">
          <button
            onClick={handleDelete}
            className="btn btn-error text-white btn-xs w-full"
          >
            Delete my Account Completely
          </button>
          <button
            onClick={handleCancel}
            className="btn bg-base-200 btn-xs w-full"
          >
            Cancel, I changed my mind
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletionConfirmation;
