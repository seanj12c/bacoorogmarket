import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineLogout } from "react-icons/ai";

import { Link, useNavigate } from "react-router-dom";

import { getAuth, signOut } from "firebase/auth";

import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";

export const NavbarAdmin = ({ users, locations, products, recipes }) => {
  const user = `${users}`;
  const location = `${locations}`;
  const product = `${products}`;
  const recipe = `${recipes}`;
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
          {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
        </div>
        <div
          className={
            nav
              ? "fixed right-0 top-0 w-[80%] h-full shadow shadow-primary bg-[#ffffff] ease-in-out duration-500"
              : "fixed right-[-100%]"
          }
        >
          <div>
            <div>
              <img className="h-20 mx-auto pt-4" src={logo} alt="" />
            </div>
            <ul className="text-left text-black  flex flex-col h-full mt-6">
              <Link to="/admin/users">
                <li className={`${user}p-4 flex gap-2 items-center `}>
                  <FaUsers size={30} />
                  Users
                </li>
              </Link>
              <Link to="/admin/locations">
                <li className={`${location} p-4 flex gap-2 items-center`}>
                  <LiaSearchLocationSolid size={30} />
                  Locations
                </li>
              </Link>

              <Link to="/admin/products">
                <li className={`${product} p-4 flex gap-2 items-center`}>
                  <GiMussel size={30} />
                  Products
                </li>
              </Link>

              <Link to="/admin/recipes">
                <li className={`${recipe} p-4 flex gap-2 items-center`}>
                  <MdOutlineRestaurantMenu size={30} />
                  Recipes
                </li>
              </Link>
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

export default NavbarAdmin;
