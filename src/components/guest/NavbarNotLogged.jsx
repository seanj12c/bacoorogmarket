import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

export const NavbarNotLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);

  useEffect(() => {
    // Use useEffect to add event listener when component mounts
    const handleScroll = () => {
      if (window.scrollY >= 50) {
        setFix(true);
      } else {
        setFix(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when component unmounts
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

  return (
    <div className="h-full">
      <div
        className={`${
          fix
            ? "bg-white opacity-95 transition-all ease-in-out duration-700"
            : ""
        } flex lg:justify-around justify-between items-center h-24 shadow-md mx-auto px-6 lg:px-2 text-primary fixed top-0 w-full lg:w-full z-50`}
      >
        <div className="lg:flex lg:w-full justify-between lg:justify-around  items-center">
          <div className="flex items-center gap-2">
            <a href="/">
              <div className="flex items-center gap-3">
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

            <div className="text-black">
              <ul className="hidden text-base gap-5 lg:flex">
                <Link to="/login" className="border-r border-black pr-4">
                  <li className="p-4 hover:text-primary">Marketplace</li>
                </Link>
                <a href="/#home">
                  <li className="p-4 hover:text-primary">Home</li>
                </a>
                <a href="/#about">
                  <li className="p-4 hover:text-primary">About</li>
                </a>
                <Link to="/login">
                  <li className="p-4 hover:text-primary">Recipe</li>
                </Link>
                <Link to="/login">
                  <li className="p-4 hover:text-primary">Chat</li>
                </Link>
                <a href="/#FAQs">
                  <li className="p-4 hover:text-primary">FAQs</li>
                </a>
              </ul>
            </div>
          </div>

          <div className="text-primary font-semibold gap-4 hidden lg:flex">
            <button className="px-4 py-2 bg-white rounded-md border-2 transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]">
              Login
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-md transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none active:shadow-none shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]">
              Join Now!
            </button>
          </div>
        </div>
        <div
          className={
            nav
              ? "fixed right-0 top-0 pr-6 h-full border border-r-primary bg-white opacity-95 ease-linear duration-500"
              : "fixed right-0 top-0 pr-6 h-full border border-r-primary bg-white opacity-0 ease-linear duration-500 pointer-events-none"
          }
        >
          <div onClick={handleNav} className="flex pt-9 justify-end lg:hidden">
            {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
          </div>
          <ul className="text-left pl-14 flex flex-col gap-4 h-full mt-6">
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
            <Link to="/login" onClick={handleNav}>
              <li className=" hover:text-primary">Marketplace</li>
            </Link>
            <a href="/#home" onClick={handleNav}>
              <li className=" hover:text-primary">Home</li>
            </a>
            <a href="/#about" onClick={handleNav}>
              <li className=" hover:text-primary">About</li>
            </a>
            <Link to="/login" onClick={handleNav}>
              <li className=" hover:text-primary">Recipe</li>
            </Link>
            <Link to="/login" onClick={handleNav}>
              <li className=" hover:text-primary">Chat</li>
            </Link>
            <a href="/#FAQs" onClick={handleNav}>
              <li className=" hover:text-primary">FAQs</li>
            </a>
          </ul>
        </div>
        <div className="flex gap-5 items-center">
          <div>
            <a href="/">
              <FaUserCircle className="block lg:hidden" size={22} />
            </a>
          </div>
          <div onClick={handleNav} className="block lg:hidden">
            {nav ? <AiOutlineMenu size={20} /> : <AiOutlineMenu size={20} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarNotLogged;
