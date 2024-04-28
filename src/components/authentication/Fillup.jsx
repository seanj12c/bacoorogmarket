import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import cam from "../../assets/cam.png";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import uploadload from "../../assets/loading.gif";
import loginbg from "../../assets/loginbg.png";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";

const Fillup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const [photoURL, setPhotoURL] = useState(null);
  const [profilePictureUploaded, setProfilePictureUploaded] = useState(false);
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.doneFillup) {
              navigate("/home");
            } else {
              setLoading(false);
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

    if (!profilePictureUploaded) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please upload your profile picture.",
      });
      return;
    }

    if (!recaptchaCompleted) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please complete the reCAPTCHA.",
      });
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      await setDoc(doc(firestore, "registered", userId), {
        firstName,
        lastName,
        contact,
        address,
        userId: userId,
        email: auth.currentUser.email,
        profilePhotoUrl: photoURL,
        doneFillup: true,
      });

      if (firstName && lastName && contact && address) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
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

      try {
        setIsUploading(true);

        const uniqueFilename = `${userId}_${Date.now()}.jpg`;

        const imagePath = `users/${userId}/${uniqueFilename}`;

        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, file);

        const photoURL = await getDownloadURL(imageRef);

        setNewProfilePicture(photoURL);
        setPhotoURL(photoURL);
        setIsUploading(false);
        setProfilePictureUploaded(true);
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        setIsUploading(false);
      }
    }
  };

  const onRecaptchaChange = (value) => {
    setRecaptchaCompleted(true);
  };

  return (
    <div>
      {!loading && (
        <div className="h-screen flex justify-center  items-center bg-transparent">
          <img
            className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
            src={loginbg}
            alt=""
          />
          <div className="w-full text-xs md:text-base md:max-w-lg bg-white mx-auto md:pt-5 pt-16 md:m-5 p-5 border rounded-lg shadow-lg">
            <h1 className="text-xl text-center font-bold mb-5">
              Fill this up to Continue
            </h1>
            <form className="text-xs" onSubmit={handleSubmit}>
              <div className="mb-2 w-full">
                <img
                  src={
                    newProfilePicture ||
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
                  {!isUploading ? (
                    <div className="w-full btn h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                      <img
                        className="w-6 object-contain"
                        src={cam}
                        alt="upload-"
                      />
                      Please upload your profile
                    </div>
                  ) : (
                    <div className="w-full h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                      <img
                        className="w-8 object-contain"
                        src={uploadload}
                        alt="loading-"
                      />
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
                <label
                  htmlFor="firstName"
                  className="input input-bordered flex items-center gap-2"
                >
                  <h1 className="w-20 text-xs">First Name</h1>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full grow px-3 py-2 border rounded-lg focus:outline-none"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    required
                  />
                </label>
              </div>

              <div className="mb-2">
                <label
                  htmlFor="lastName"
                  className="input input-bordered flex items-center gap-2"
                >
                  <h1 className="w-20 text-xs"> Last Name</h1>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    required
                  />
                </label>
              </div>

              <div className="mb-2">
                <label
                  htmlFor="contact"
                  className="input input-bordered flex items-center gap-2"
                >
                  <h1 className="w-20 text-xs"> Contact Number</h1>
                  <input
                    type="text"
                    id="contact"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    value={contact}
                    onChange={(e) => {
                      const regex = /^[0-9]*$/;
                      if (regex.test(e.target.value) || e.target.value === "") {
                        setContact(e.target.value);
                      }
                    }}
                    placeholder="0912345689"
                    maxLength="11"
                    minLength="11"
                    required
                  />
                </label>
              </div>

              <div className="mb-2">
                <label
                  htmlFor="address"
                  className="input input-bordered flex items-center gap-2"
                >
                  <h1 className="w-20 text-xs"> Full Address</h1>
                  <input
                    type="text"
                    id="address"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, Bacoor City"
                    required
                  />
                </label>
              </div>

              <div className="mb-2 flex justify-center">
                <ReCAPTCHA
                  sitekey="6LfMC7MpAAAAALEC3epHtCPGpNsPiB4r3pSwrvL-"
                  onChange={onRecaptchaChange}
                />
              </div>

              <button
                type="submit"
                className="bg-primary btn hover:text-primary text-white px-4 py-2 rounded-lg w-full focus:outline-none"
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
