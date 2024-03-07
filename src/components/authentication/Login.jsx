import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
  const handleGoogleSignUp = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User signed in with Google:", user);
        if (user.email === "bacoorogmarket@gmail.com") {
          // Redirect to the admin page if user's email matches
          navigate("/admin/users");
        } else {
          // Redirect to the home page for regular users
          navigate("/fillup");
        }
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
            Welcome Back
          </h1>
          <div className="md:flex gap-1 text-xs text-center justify-center pb-4">
            <p className="text-gray-800">Don't you have an account yet? </p>
            <Link to="/register">
              <p className="text-primary">Create account</p>
            </Link>
          </div>
        </div>

        <div className="border py-10 rounded-lg  w-full">
          <div className="text-xs md:text-base  text-center">
            <p>
              Welcome to{" "}
              <span className="font-bold">Bacoor Ocean Gem Market,</span>
            </p>
            <p>sign in with</p>
          </div>
          <div className="px-5 py-3">
            <button
              className="w-full  bg-white text-black py-2 border mt-2 rounded-lg hover:bg-gray-100 "
              onClick={handleGoogleSignUp}
            >
              <FcGoogle className="inline-block mr-2" />
              Google
            </button>
            {error && (
              <div className="text-red-500 pl-2 text-xs mt-2">{error}</div>
            )}
          </div>
          <div className="text-xs md:text-base flex justify-center text-center">
            <p>
              By signing in, you agree to our{" "}
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
