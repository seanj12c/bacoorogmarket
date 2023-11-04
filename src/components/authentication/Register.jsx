import React, { useState } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "../../firebase";
import loginbg from "../../assets/loginbg.jpg";
import RegistrationCompleteModal from "./RegistrationCompleteModal";
import PrivacyPolicy from "./PrivacyPolicy";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const openPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = () => {
    setError(null);
    setIsRegistering(true);

    const auth = getAuth();

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User created:", user);

        const userId = user.uid;
        const userDocRef = doc(firestore, "registered", userId);

        const newUser = {
          userId,
          firstName,
          lastName,
          address,
          email,
        };

        setDoc(userDocRef, newUser)
          .then(() => {
            console.log("Document written with ID: ", userDocRef.id);
            setShowModal(true);
          })
          .catch((error) => {
            const errorMessage = error.message
              .split(":")
              .slice(1)
              .join(":")
              .trim();
            setError(errorMessage);
          });
      })
      .catch((error) => {
        const errorMessage = error.message.split(":").slice(1).join(":").trim();
        setError(errorMessage);
      })
      .finally(() => {
        setIsRegistering(false); // Re-enable the registration button
      });
  };

  const closeRegistrationModal = () => {
    setShowModal(false);
  };

  const handleLoginNowClick = () => {
    console.log("Login Now clicked!");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Prevent the default form submission behavior
      e.preventDefault();
      handleSignUp();
    }
  };

  return (
    <div className="h-full w-full mx-auto bg-primary lg:bg-transparent">
      <img
        className="z-[-1] absolute hidden lg:block h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="flex justify-center lg:justify-end items-center pb-12 md:pb-0 min-h-screen">
        <div className="lg:h-screen w-full mx-3 lg:mx-0 max-w-md lg:max-w-lg p-6 lg:p-8 bg-white lg:rounded-none rounded-lg shadow-2xl">
          <div>
            <h1 className="text-3xl lg:text-4xl py-1 text-center font-bold">
              Registration
            </h1>
            <div className="md:flex gap-2 text-xs text-center justify-center pb-4">
              <p className="text-gray-800">Already have an account? </p>
              <Link to="/login">
                <p className="text-primary">Login now!</p>
              </Link>
            </div>
          </div>
          <div className="mb-4 text-xs lg:text-base">
            <label htmlFor="email" className="block text-gray-800 mb-2">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="First Name"
              value={firstName}
              onChange={handleFirstNameChange}
              required
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="mb-4 text-xs lg:text-base">
            <label htmlFor="email" className="block text-gray-800 mb-2">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Last Name"
              value={lastName}
              onChange={handleLastNameChange}
              required
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="mb-4 text-xs lg:text-base">
            <label htmlFor="email" className="block text-gray-800 mb-2">
              Complete Address<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Complete Address"
              value={address}
              onChange={handleAddressChange}
              required
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="mb-4 text-xs lg:text-base">
            <label htmlFor="email" className="block text-gray-800 mb-2">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              required
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="mb-4 text-xs lg:text-base">
            <label htmlFor="password" className="block text-gray-800 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                onKeyPress={handleKeyPress}
              />
              <button
                className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                onClick={handleShowPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <div className="text-xs py-1 flex justify-center text-center">
            <p>
              By clicking Register you agree to our{" "}
              <button
                className="text-primary underline"
                onClick={openPrivacyPolicy}
              >
                Privacy Policy for Bacoor's Ocean Gem Market
              </button>
            </p>
          </div>
          <button
            className={`w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark focus:outline-none cursor-${
              isRegistering ? "not-allowed" : "pointer"
            }`}
            onClick={handleSignUp}
            disabled={isRegistering}
          >
            {isRegistering ? "Please wait..." : "Register"}
          </button>
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
