import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  onSnapshot, // Import onSnapshot
} from "firebase/firestore";
import { useAuth } from "../../authContext";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MyAccount = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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
            setUserData(data);

            // Subscribe to changes in the profilePhotoUrl field
            onSnapshot(userDocRef, (doc) => {
              const newData = doc.data();
              if (newData && newData.profilePhotoUrl) {
                setUserData(newData);
              }
            });
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

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    if (file) {
      const userId = auth.currentUser.uid;
      const type = "profile";

      const db = getFirestore();
      const userDocRef = doc(db, "registered", userId);

      try {
        setIsUploading(true);

        const storage = getStorage();
        const imageRef = ref(storage, `users/${userId}/${type}.jpg`);
        await uploadBytes(imageRef, file);

        const photoURL = await getDownloadURL(imageRef);

        await updateDoc(userDocRef, { [`${type}PhotoUrl`]: photoURL });

        console.log("Profile photo updated");

        setNewProfilePicture(null);
        setIsUploading(false);
      } catch (error) {
        console.error("Error updating profile photo:", error);
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-xl pt-24 mx-auto p-4">
      {loading ? (
        <p>Loading user data...</p>
      ) : userData ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">My Account</h2>
          {auth.currentUser ? (
            <div>
              <div className="mb-4 relative">
                <label
                  htmlFor="profile-picture"
                  className="block text-gray-800 mb-2 cursor-pointer"
                >
                  {isUploading ? "Uploading..." : "Change Profile Picture"}
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {userData.profilePhotoUrl && !isUploading ? (
                  <img
                    src={userData.profilePhotoUrl}
                    alt="Profile"
                    className="object-cover"
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "10px solid #fff",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                    alt="Default Profile"
                    className="object-cover"
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "10px solid #fff",
                      borderRadius: "50%",
                    }}
                  />
                )}
                {newProfilePicture && isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <p>
                <strong>User ID:</strong> {auth.currentUser.uid}
              </p>
            </div>
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
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 mt-4 rounded-lg hover-bg-red-600 focus:outline-none"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default MyAccount;
