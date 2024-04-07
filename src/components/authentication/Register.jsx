import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"; // Import Firestore
import loginbg from "../../assets/loginbg.png";

import PrivacyPolicy from "./PrivacyPolicy";
import { useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [error, setError] = useState(null); // State variable for holding error
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user's email, userId, and doneFillup status in Firestore
      const db = getFirestore();
      const userRef = doc(collection(db, "registered"), user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          userId: user.uid,
          doneFillup: false,
        });
      }

      navigate("/home");
    } catch (error) {
      let errorMessage = error.message;

      // Map Firebase error messages to custom messages
      if (errorMessage.includes("auth/popup-closed-by-user")) {
        errorMessage = "Pop-up was closed by the user";
      } else if (errorMessage.includes("auth/user-disabled")) {
        errorMessage = "Admin disabled your account";
      } else if (errorMessage.includes("auth/cancelled-popup-request")) {
        errorMessage = "Pop-up was closed by the user";
      }

      setError(errorMessage);
    }
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
          </div>
          <div className="px-5 py-3">
            <button
              className="w-full btn bg-white text-black py-2 border mt-2 rounded-lg hover:bg-gray-100 "
              onClick={handleGoogleSignUp}
            >
              <FcGoogle className="inline-block mr-2" />
              Register using Google
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
