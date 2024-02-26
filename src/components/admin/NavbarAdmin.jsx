import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineLogout } from "react-icons/ai";

import { Link, useNavigate } from "react-router-dom";

import { getAuth, signOut } from "firebase/auth";

import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

export const NavbarNotLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);

  const navigate = useNavigate();

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

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

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
        } flex justify-between ease-linear duration-500 items-center h-24 shadow-md mx-auto px-6  text-primary fixed top-0 w-full  z-50`}
      >
        <div onClick={handleNav} className="block ">
          {nav ? <AiOutlineMenu size={25} /> : <AiOutlineMenu size={25} />}
        </div>
        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[80%] h-full shadow shadow-primary bg-[#ffffff] ease-in-out duration-500"
              : "fixed left-[-100%]"
          }
        >
          <div onClick={handleNav} className="flex pl-6 pt-9 justify-start ">
            {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
          </div>
          <div>
            <ul className="text-left text-black pl-6 pr-14 flex flex-col gap-4 h-full mt-6">
              <li className=" hover:text-primary flex gap-2 items-center">
                <FaUsers size={30} className="text-primary" />
                Users
              </li>

              <a href="/#home" onClick={handleNav}>
                <li className=" hover:text-primary flex gap-2 items-center">
                  <LiaSearchLocationSolid size={30} className="text-primary" />
                  Locations
                </li>
              </a>
              <a href="/#about" onClick={handleNav}>
                <li className=" hover:text-primary flex gap-2 items-center">
                  <GiMussel size={30} className="text-primary" />
                  Products
                </li>
              </a>

              <li className=" hover:text-primary flex gap-2 items-center">
                <MdOutlineRestaurantMenu size={30} className="text-primary" />
                Recipes
              </li>
            </ul>
          </div>
        </div>
        <div>
          <h1 className="text-center text-black">Admin Panel</h1>
        </div>

        <div className="flex gap-5 items-center">
          <button onClick={handleLogout}>
            <AiOutlineLogout size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarNotLogged;
