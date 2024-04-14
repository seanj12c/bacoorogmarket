import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineLogout } from "react-icons/ai";

import { Link, useNavigate } from "react-router-dom";

import { getAuth, signOut } from "firebase/auth";
import Swal from "sweetalert2";
import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { RiDeleteBin6Line } from "react-icons/ri";

export const NavbarAdmin = ({
  users,
  locations,
  products,
  recipes,
  appeals,
  reports,
  deletions,
}) => {
  const user = `${users}`;
  const location = `${locations}`;
  const product = `${products}`;
  const recipe = `${recipes}`;
  const appeal = `${appeals}`;
  const report = `${reports}`;
  const deletionRequest = `${deletions}`;
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

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

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
          fix ? "bg-white transition-all ease-in-out duration-700" : ""
        } flex justify-between ease-linear duration-500 items-center h-24 shadow-md mx-auto px-6  text-primary fixed top-0 w-full  z-50`}
      >
        <div onClick={handleNav} className="block ">
          {nav ? (
            <AiOutlineClose className="btn btn-sm btn-square btn-error text-xs text-white" />
          ) : (
            <AiOutlineMenu className="btn btn-sm btn-square btn-primary text-xs text-white" />
          )}
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
                <li className={`${user} p-4 flex gap-2 items-center `}>
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

              <Link to="/admin/appeal">
                <li className={`${appeal} p-4 flex gap-2 items-center`}>
                  <FaFile size={30} />
                  Appeal
                </li>
              </Link>

              <Link to="/admin/reports">
                <li className={`${report} p-4 flex gap-2 items-center`}>
                  <MdOutlineReport size={30} />
                  Reports
                </li>
              </Link>

              <Link to="/admin/delete/user">
                <li
                  className={`${deletionRequest} p-4 flex gap-2 items-center`}
                >
                  <RiDeleteBin6Line size={30} />
                  Deletion Requests
                </li>
              </Link>
            </ul>
          </div>
        </div>
        <div>
          <h1 className="text-center text-black">Admin Panel</h1>
        </div>

        <div className="flex gap-5 items-center">
          <button
            className="btn btn-sm btn-square text-white btn-error"
            onClick={handleLogoutConfirmation}
          >
            <AiOutlineLogout size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavbarAdmin;
