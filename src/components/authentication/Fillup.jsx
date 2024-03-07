import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import cam from "../../assets/cam.png";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import uploadload from "../../assets/loading.gif";
import loginbg from "../../assets/loginbg.png";

const Fillup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

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

            onSnapshot(userDocRef, (doc) => {
              const newData = doc.data();
              if (newData && newData.profilePhotoUrl) {
                setUserData(newData);
              }
            });

            // Check if all necessary fields are filled, and redirect to "/home" if they are
            if (
              data.firstName &&
              data.lastName &&
              data.contact &&
              data.address
            ) {
              navigate("/home");
            }
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
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = auth.currentUser.uid;

      // Set user data to Firestore with user's userID as document ID
      await setDoc(doc(firestore, "registered", userId), {
        firstName,
        lastName,
        contact,
        address,
        userId: userId,
        email: auth.currentUser.email,
        profilePhotoUrl: userData?.profilePhotoUrl,
      });

      console.log("Document written with ID: ", userId);

      setFirstName("");
      setLastName("");
      setContact("");
      setAddress("");
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const uploadProfilePicture = async (file) => {
    if (file) {
      const userId = auth.currentUser.uid;

      const db = getFirestore();
      const userDocRef = doc(db, "registered", userId);

      try {
        setIsUploading(true);

        const uniqueFilename = `${userId}_${Date.now()}.jpg`;

        const imagePath = `users/${userId}/${uniqueFilename}`;

        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, file);

        const photoURL = await getDownloadURL(imageRef);

        const updatedData = {
          ...userData,
          profilePhotoUrl: photoURL,
        };

        await updateDoc(userDocRef, updatedData);

        console.log("Profile photo updated");

        setNewProfilePicture(null);
        setIsUploading(false);
      } catch (error) {
        console.error("Error updating profile photo:", error);
        setIsUploading(false);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="h-screen pt-0 w-full grid items-center">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto flex justify-center items-center"
            src={uploadload}
            alt=""
          />
        </div>
      ) : (
        <div className="h-screen flex justify-center px-3 md:px-0 items-center bg-transparent">
          <img
            className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
            src={loginbg}
            alt=""
          />
          <div className="w-full text-xs md:text-base max-w-lg bg-white mx-auto m-5 p-5 border rounded-lg shadow-lg">
            <h1 className="text-xl text-center font-bold mb-5">
              Fill this up to Continue
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-2 w-full">
                <img
                  src={
                    userData?.profilePhotoUrl ||
                    "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                  }
                  alt="Profile"
                  className="object-cover mx-auto"
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "2px solid #008080",
                    borderRadius: "50%",
                  }}
                />
                <label htmlFor="profile-picture" className="cursor-pointer">
                  {isUploading ? (
                    <div className="w-full h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                      <img
                        className="w-8 object-contain"
                        src={uploadload}
                        alt="loading-"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                      <img
                        className="w-6 object-contain"
                        src={cam}
                        alt="upload-"
                      />
                      Change Profile Picture
                    </div>
                  )}
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {newProfilePicture && isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label htmlFor="firstName" className="block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label htmlFor="lastName" className="block mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label htmlFor="contact" className="block mb-1">
                  Contact Number
                </label>
                <input
                  type="number"
                  id="contact"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label htmlFor="address" className="block mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg w-full focus:outline-none"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fillup;
