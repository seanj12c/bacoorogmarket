import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FaArrowAltCircleUp, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import lock from "../../assets/lock.gif";
import {
  CiShop,
  CiHome,
  CiChat1,
  CiCircleQuestion,
  CiForkAndKnife,
} from "react-icons/ci";
import { LiaSearchLocationSolid } from "react-icons/lia";

export const NavbarNotLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleGoToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 500) {
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
            <a href="/#home">
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
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    Marketplace
                  </li>
                </button>
                <a href="/#home">
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    Home
                  </li>
                </a>
                <button onClick={toggleOverlay}>
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    Sellers
                  </li>
                </button>
                <button onClick={toggleOverlay}>
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    Recipe
                  </li>
                </button>
                <button onClick={toggleOverlay}>
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    Chats
                  </li>
                </button>
                <a href="/#FAQs">
                  <li className="p-4 hover:text-primary hover:-translate-y-1 duration-300 ease-in-out transition-all">
                    FAQs
                  </li>
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
                <div className="flex justify-center p-3">
                  <img className="h-20 object-contain" src={lock} alt="" />
                </div>
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
            <Link to={"/login"} className="btn bg-white text-primary">
              Login
            </Link>
            <Link to={"/register"} className="btn btn-primary text-white">
              Join Now!
            </Link>
          </div>
        </div>
        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[80%] h-full shadow shadow-primary bg-[#ffffff] ease-in-out duration-500"
              : "fixed left-[-100%]"
          }
        >
          <div
            onClick={handleNav}
            className="flex pl-6 pt-9 justify-start lg:hidden"
          >
            {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
          </div>
          <div>
            <ul className="text-left text-black pl-6 pr-14 flex flex-col gap-4 h-full mt-6">
              <li
                onClick={handleButtonToggle}
                className=" hover:text-primary flex gap-2 items-center"
              >
                <CiShop size={30} className="text-primary" />
                Marketplace
              </li>

              <a href="/#home" onClick={handleNav}>
                <li className=" hover:text-primary flex gap-2 items-center">
                  <CiHome size={30} className="text-primary" />
                  Home
                </li>
              </a>
              <li
                onClick={handleButtonToggle}
                className=" hover:text-primary flex gap-2 items-center"
              >
                <LiaSearchLocationSolid size={30} className="text-primary" />
                Sellers
              </li>

              <li
                onClick={handleButtonToggle}
                className=" hover:text-primary flex gap-2 items-center"
              >
                <CiForkAndKnife size={30} className="text-primary" />
                Recipe
              </li>

              <li
                onClick={handleButtonToggle}
                className=" hover:text-primary flex gap-2 items-center"
              >
                <CiChat1 size={30} className="text-primary" />
                Chats
              </li>

              <a href="/#FAQs" onClick={handleNav}>
                <li className=" hover:text-primary flex gap-2 items-center">
                  <CiCircleQuestion size={30} className="text-primary" />
                  FAQs
                </li>
              </a>
              <div className="border-t-gray-500 border-t"></div>
              <div className="flex flex-col gap-2 w-full">
                <Link to="/login">
                  <button className="btn btn-primary text-white w-full">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="btn btn-primary text-white w-full">
                    Register
                  </button>
                </Link>
              </div>
            </ul>
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
            <button onClick={toggleOverlay}>
              <FaUserCircle className="block lg:hidden" size={22} />
            </button>
          </div>
        </div>
      </div>
      <div>
        <button
          className={`${
            fix
              ? "fixed z-10 btn btn-circle duration-300 ease-in-out btn-primary bottom-10 right-10"
              : "fixed z-10 btn btn-circle duration-300 ease-in-out btn-primary bottom-10 right-10 hidden"
          } `}
          onClick={handleGoToTop}
        >
          <FaArrowAltCircleUp size={30} />
        </button>
      </div>
    </div>
  );
};

export default NavbarNotLogged;
