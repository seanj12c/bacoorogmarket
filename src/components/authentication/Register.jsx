import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore"; // Import Firestore
import loginbg from "../../assets/loginbg.png";
import RegistrationCompleteModal from "./RegistrationCompleteModal";
import PrivacyPolicy from "./PrivacyPolicy";
import { useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [error, setError] = useState(null); // State variable for holding error
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        const db = getFirestore();
        const userRef = doc(collection(db, "registered"), user.uid);

        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              // Document exists, redirect to home
              navigate("/home");
            } else {
              // Document doesn't exist, redirect to fillup
              navigate("/fillup");
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });
      } else {
        // No user is signed in.
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignUp = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // No need to handle redirection here, useEffect handles it
      })
      .catch((error) => {
        const errorMessage = "Error logging in. Please try again.";
        setError(errorMessage); // Set generic error message
      });
  };

  const closeRegistrationModal = () => {
    setShowModal(false);
  };

  const handleLoginNowClick = () => {
    console.log("Login Now clicked!");
  };

  return (
    <div className="h-screen flex justify-center px-3 md:px-0 items-center bg-transparent">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="w-full  bg-white max-w-md p-6 lg:p-8  shadow-primary rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl lg:text-4xl py-1 text-center font-bold">
            Create an account!
          </h1>
          <div className="flex gap-2 text-xs text-center justify-center pb-4">
            <p className="text-gray-800">Already have an account? </p>
            <Link to="/login">
              <p className="text-primary">Sign in</p>
            </Link>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}{" "}
        <div className="border py-10 rounded-lg  w-full">
          <div className="text-xs md:text-base  text-center">
            <p>
              Welcome to{" "}
              <span className="font-bold">Bacoor Ocean Gem Market,</span>
            </p>
            <p>register with</p>
          </div>
          <div className="px-5 py-3">
            <button
              className="w-full  bg-white text-black py-2 border mt-2 rounded-lg hover:bg-gray-100 "
              onClick={handleGoogleSignUp}
            >
              <FcGoogle className="inline-block mr-2" />
              Google
            </button>
          </div>
          <div className="text-xs md:text-base flex justify-center text-center">
            <p>
              By registering, you agree to our{" "}
              <button
                className="text-primary underline"
                onClick={() => setShowPrivacyPolicy(true)}
              >
                Terms of Service and Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <RegistrationCompleteModal
          onClose={closeRegistrationModal}
          onLoginNowClick={handleLoginNowClick}
        />
      )}

      {showPrivacyPolicy && (
        <PrivacyPolicy
          onClose={() => setShowPrivacyPolicy(false)}
          onContinue={() => setShowPrivacyPolicy(false)}
        />
      )}
    </div>
  );
};

export default Register;
