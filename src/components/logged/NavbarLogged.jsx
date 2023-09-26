import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";

export const NavbarLogged = () => {
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
    setNav(!nav);
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
          <a href="/">
            <div>
              <img
                className="object-contain lg:w-20 w-16 select-none pointer-events-none"
                src={logo}
                alt=""
              />
            </div>
          </a>

          <div className="text-black">
            <ul className="hidden text-base gap-5 lg:flex">
              <a href="/" className="border-r pr-4">
                <li className="p-4 hover:text-primary">Marketplace</li>
              </a>
              <a href="/">
                <li className="p-4 hover:text-primary">Home</li>
              </a>
              <a href="/">
                <li className="p-4 hover:text-primary">About</li>
              </a>
              <a href="/">
                <li className="p-4 hover:text-primary">Recipe</li>
              </a>
              <a href="/">
                <li className="p-4 hover:text-primary">Chat</li>
              </a>
              <a href="/">
                <li className="p-4 hover:text-primary">FAQs</li>
              </a>
            </ul>
          </div>
          <div className="lg:flex hidden gap-2 items-center text-black border p-2 rounded-lg">
            <input
              type="text"
              placeholder="Search.."
              className="outline-none w-52"
            ></input>
            <AiOutlineSearch className="lg:block hidden text-black" size={20} />
          </div>

          <div className="flex gap-5 items-center">
            <a href="/">
              <FaUserCircle
                className="lg:block hidden text-primary"
                size={40}
              />
            </a>
          </div>
        </div>

        <div
          className={
            nav
              ? "fixed right-0 top-0 pr-6 h-full border- border-r-primary bg-white opacity-95 ease-linear duration-500"
              : "fixed right-[-100%] ease-linear duration-500"
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
            <a href="/" onClick={handleNav}>
              <li className=" hover:text-primary">Marketplace</li>
            </a>
            <a href="/" onClick={handleNav}>
              <li className=" hover:text-primary">Home</li>
            </a>
            <a href="/" onClick={handleNav}>
              <li className=" hover:text-primary">About</li>
            </a>
            <a href="/" onClick={handleNav}>
              <li className=" hover:text-primary">Recipe</li>
            </a>
            <a href="/" onClick={handleNav}>
              <li className=" hover:text-primary">Chat</li>
            </a>
            <a href="/" onClick={handleNav}>
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

export default NavbarLogged;
