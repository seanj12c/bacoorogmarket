import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

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
          <Link to={"/home"}>
            <div>
              <img
                className="object-contain lg:w-20 w-16 select-none pointer-events-none"
                src={logo}
                alt=""
              />
            </div>
          </Link>

          <div className="text-black">
            <ul className="hidden text-base gap-5 lg:flex">
              <Link to={"/marketplace"} className="border-r border-black pr-4">
                <li className="p-4 hover:text-primary">Marketplace</li>
              </Link>
              <Link to={"/home"}>
                <li className="p-4 hover:text-primary">Home</li>
              </Link>
              <Link to={"/about"}>
                <li className="p-4 hover:text-primary">About</li>
              </Link>
              <Link to={"/recipe"}>
                <li className="p-4 hover:text-primary">Recipe</li>
              </Link>
              <Link to={"/chat"}>
                <li className="p-4 hover:text-primary">Chat</li>
              </Link>
              <Link to={"/faqs"}>
                <li className="p-4 hover:text-primary">FAQs</li>
              </Link>
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
            <Link to={"/myaccount"}>
              <FaUserCircle
                className="lg:block hidden text-primary"
                size={40}
              />
            </Link>
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
            <Link to={"/marketplace"} onClick={handleNav}>
              <li className=" hover:text-primary">Marketplace</li>
            </Link>
            <Link to={"/home"} onClick={handleNav}>
              <li className=" hover:text-primary">Home</li>
            </Link>
            <Link to={"/about"} onClick={handleNav}>
              <li className=" hover:text-primary">About</li>
            </Link>
            <Link to={"/recipe"} onClick={handleNav}>
              <li className=" hover:text-primary">Recipe</li>
            </Link>
            <Link to={"/chat"} onClick={handleNav}>
              <li className=" hover:text-primary">Chat</li>
            </Link>
            <Link to={"/faqs"} onClick={handleNav}>
              <li className=" hover:text-primary">FAQs</li>
            </Link>
          </ul>
        </div>
        <div className="flex gap-5 items-center">
          <div>
            <Link to={"/myaccount"}>
              <FaUserCircle className="block lg:hidden" size={22} />
            </Link>
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
