import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

export const NavbarNotLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 50) {
        setFix(true);
      } else {
        setFix(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNav = () => {
    if (nav) {
      setNav(false);
    } else {
      setTimeout(() => {
        setNav(true);
      }, 10);
    }
  };

  const handleButtonToggle = () => {
    toggleOverlay();
    handleNav();
  };

  return (
    <div className="h-full">
      <div
        className={`${
          fix
            ? "bg-white opacity-95 transition-all ease-in-out duration-700"
            : ""
        } flex lg:justify-around justify-between ease-linear duration-500 items-center h-24 shadow-md mx-auto px-6 lg:px-2 text-primary fixed top-0 w-full lg:w-full z-50`}
      >
        <div className="lg:flex lg:w-full justify-between lg:justify-around  items-center">
          <div className="lg:flex items-center lg:gap-2">
            <a href="/">
              <div className="lg:flex items-center gap-3 hidden">
                <img
                  className="object-contain lg:w-20 w-16 select-none pointer-events-none"
                  src={logo}
                  alt=""
                />
                <h1 className="sm:text-xs hidden sm:block md:text-lg font-bold text-black lg:hidden">
                  Bacoor's Ocean Gem Market
                </h1>
              </div>
            </a>
            <div onClick={handleNav} className="block lg:hidden">
              {nav ? <AiOutlineMenu size={25} /> : <AiOutlineMenu size={25} />}
            </div>

            <div className="text-black">
              <ul className="hidden text-base gap-5 lg:flex">
                <button
                  onClick={toggleOverlay}
                  className="border-r border-black pr-4"
                >
                  <li className="p-4 hover:text-primary">Marketplace</li>
                </button>
                <a href="/#home">
                  <li className="p-4 hover:text-primary">Home</li>
                </a>
                <a href="/#about">
                  <li className="p-4 hover:text-primary">About</li>
                </a>
                <button onClick={toggleOverlay}>
                  <li className="p-4 hover:text-primary">Recipe</li>
                </button>
                <button onClick={toggleOverlay}>
                  <li className="p-4 hover:text-primary">Chat</li>
                </button>
                <a href="/#FAQs">
                  <li className="p-4 hover:text-primary">FAQs</li>
                </a>
              </ul>
            </div>
          </div>
          {showOverlay && (
            <div className="fixed inset-0 flex items-center justify-center z-50 ease-linear duration-500 bg-black bg-opacity-50">
              <div className="bg-white p-8 rounded-lg shadow-lg transform scale-100 transition-transform duration-300">
                <p className="text-center text-lg font-semibold mb-4">
                  Please log in to continue....
                </p>
                <div className="flex justify-around">
                  <button
                    onClick={toggleOverlay}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md w-20 mx-auto"
                  >
                    Close
                  </button>
                  <Link
                    to={"/login"}
                    onClick={toggleOverlay}
                    className="bg-primary text-white font-semibold py-2 px-4 rounded-md w-20 mx-auto"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="text-primary font-semibold gap-4 hidden lg:flex">
            <Link
              to={"/login"}
              className="px-4 py-2 bg-white rounded-md border-2 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]"
            >
              Login
            </Link>
            <Link
              to={"/register"}
              className="px-4 py-2 bg-primary text-white rounded-md transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]"
            >
              Join Now!
            </Link>
          </div>
        </div>
        <div
          className={
            nav
              ? "fixed left-0 top-0 pr-6 h-full border border-r-primary bg-white opacity-95 ease-linear duration-500"
              : "fixed left-0 top-0 pr-6 h-full border border-r-primary bg-white opacity-0 ease-linear duration-500 pointer-events-none"
          }
        >
          <div
            onClick={handleNav}
            className="flex pl-6 pt-9 justify-start lg:hidden"
          >
            {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
          </div>
          <ul className="text-left pl-6 pr-14 flex flex-col gap-4 h-full mt-6 lg:hidden">
            <div className="flex lg:hidden gap-2 items-center text-black border p-1 rounded-lg">
              <input
                type="text"
                placeholder="Search.."
                className="outline-none text-xs w-24"
              ></input>
              <AiOutlineSearch
                className="block lg:hidden text-black"
                size={18}
              />
            </div>
            <p onClick={handleButtonToggle}>
              <li className=" hover:text-primary">Marketplace</li>
            </p>
            <a href="/#home" onClick={handleNav}>
              <li className=" hover:text-primary">Home</li>
            </a>
            <a href="/#about" onClick={handleNav}>
              <li className=" hover:text-primary">About</li>
            </a>
            <p onClick={handleButtonToggle}>
              <li className=" hover:text-primary">Recipe</li>
            </p>
            <p onClick={handleButtonToggle}>
              <li className=" hover:text-primary">Chat</li>
            </p>
            <a href="/#FAQs" onClick={handleNav}>
              <li className=" hover:text-primary">FAQs</li>
            </a>
          </ul>
          <div>
            <button>Login</button>
          </div>
        </div>
        <div className="block lg:hidden">
          <img
            className="object-contain lg:w-20 w-16 select-none pointer-events-none"
            src={logo}
            alt=""
          />
        </div>
        <div className="flex gap-5 items-center">
          <div>
            <a href="/">
              <FaUserCircle className="block lg:hidden" size={22} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarNotLogged;
