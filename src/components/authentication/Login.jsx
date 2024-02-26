import React, { useState } from "react";
import { Link } from "react-router-dom";
import loginbg from "../../assets/loginbg.jpg";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSignIn = () => {
    setLoginError(null);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User logged in:", user);

        localStorage.setItem("userId", user.uid);

        if (user.email === "bacoorogmarket@gmail.com") {
          // Redirect to the admin page
          navigate("/admin");
        } else {
          // Redirect to the home page for regular users
          navigate("/home");
        }
      })
      .catch((error) => {
        setLoginError(error.message);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Prevent the default form submission behavior
      e.preventDefault();
      handleSignIn();
    }
  };

  return (
    <div className="h-full w-full mx-auto bg-primary lg:bg-transparent">
      <img
        className="z-[-1] absolute hidden lg:block h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="flex justify-center lg:justify-start items-center pb-20 md:pb-0 min-h-screen">
        <div className="lg:h-screen w-full mx-3 lg:mx-0 max-w-md lg:max-w-lg p-6 lg:px-8 lg:pt-28 bg-white lg:rounded-none rounded-lg shadow-2xl">
          <div>
            <h1 className="text-3xl lg:text-4xl py-1 text-center font-bold">
              Welcome Back!
            </h1>
            <div className="md:flex gap-2 text-xs text-center justify-center pb-4">
              <p className=" text-gray-800">Do not have an account yet? </p>
              <Link to="/register">
                <p className="text-primary">Create account</p>
              </Link>
            </div>
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
                onKeyPress={handleKeyPress} // Add this line
              />
              <button
                className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                onClick={handleShowPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 text-sm md:text-base">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 leading-tight"
                checked={rememberMe}
                onChange={handleRememberMe}
              />
              <span className="text-gray-800">Remember Me</span>
            </label>
            <a href="/" className="text-primary text-sm">
              Forgot Password?
            </a>
          </div>
          {loginError && (
            <div className="text-red-500 text-sm mt-2">{loginError}</div>
          )}
          <button
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark focus:outline-none"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
