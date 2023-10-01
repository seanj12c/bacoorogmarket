import React, { useState } from "react";
import { Link } from "react-router-dom";
import loginbg from "../../assets/loginbg.jpg";
const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignIn = () => {
    // Sample palang to ngayon lagyan ko to database
    console.log("Email:", email);
    console.log("Password:", password);
  };
  return (
    <div className="h-full w-full mx-auto bg-primary lg:bg-transparent">
      <img
        className="z-[-1] absolute hidden lg:block h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="flex justify-center lg:justify-end items-center min-h-screen">
        <div className="lg:h-screen w-full mx-3 lg:mx-0 max-w-md lg:max-w-lg p-6 lg:p-8 bg-white lg:rounded-none rounded-lg shadow-2xl">
          <div>
            <h1 className="text-3xl lg:text-4xl py-1 text-center font-bold">
              Registration
            </h1>
            <div className="md:flex gap-2 text-xs text-center justify-center pb-4">
              <p className=" text-gray-800">Already have an account? </p>
              <Link to="/login">
                <p className="text-primary">Login now!</p>
              </Link>
            </div>
          </div>
          <div className="mb-4 text-xs md:text-base">
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
            />
          </div>
          <div className="mb-4 text-xs md:text-base">
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
            />
          </div>
          <div className="mb-4 text-xs md:text-base">
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
            />
          </div>
          <div className="mb-4 text-xs md:text-base">
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
            />
          </div>
          <div className="mb-4 text-xs md:text-base">
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
              />
              <button
                className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                onClick={handleShowPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="text-xs py-1 flex justify-center text-center">
            <p>
              By clicking Register you agree on our{" "}
              <button className="text-primary underline">
                Privacy Policy for Bacoor's Ocean Gem Market
              </button>
            </p>
          </div>
          <button
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark focus:outline-none"
            onClick={handleSignIn}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
