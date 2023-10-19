import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../authContext";

const MyAccount = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId); // Use the user's UID as the document ID

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
          } else {
            console.log("No such document for this user!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user is authenticated.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [auth]);

  return (
    <div className="max-w-xl mx-auto p-4">
      {loading ? (
        <p>Loading user data...</p>
      ) : userData ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Account</h2>
          {auth.currentUser ? (
            <p>
              <strong>User ID:</strong> {auth.currentUser.uid}
            </p>
          ) : null}
          <p>
            <strong>First Name:</strong> {userData.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {userData.lastName}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Address:</strong> {userData.address}
          </p>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default MyAccount;
