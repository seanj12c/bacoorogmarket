import React, { useState, useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FaArrowAltCircleUp, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { getFirestore, doc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

import {
  CiShop,
  CiHome,
  CiChat1,
  CiCircleQuestion,
  CiForkAndKnife,
  CiSearch,
} from "react-icons/ci";
import Swal from "sweetalert2";

import { MdOutlineManageAccounts } from "react-icons/md";
import { LiaSearchLocationSolid } from "react-icons/lia";

export const NavbarLogged = () => {
  const [fix, setFix] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const auth = useAuth();
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

  useEffect(() => {
    const getCurrentUserProfilePicture = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        try {
          const profilePhotoUrl = await getProfilePictureUrl(userId);
          setProfilePicture(profilePhotoUrl);
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    if (auth.currentUser) {
      getCurrentUserProfilePicture();
      const db = getFirestore();
      const userDocRef = doc(db, "registered", auth.currentUser.uid);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        const userData = doc.data();
        if (userData && userData.profilePhotoUrl) {
          setProfilePicture(userData.profilePhotoUrl);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [auth]);

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

  const getProfilePictureUrl = async (userId) => {
    const db = getFirestore();
    const userDocRef = doc(db, "registered", userId);

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData && userData.profilePhotoUrl) {
          return userData.profilePhotoUrl;
        }
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }

    // Return a default image URL or handle error cases accordingly
    return ""; // Provide a default URL or handle error cases
  };

  return (
    <div className="h-full">
      <div
        className={`${
          fix
            ? "bg-white opacity-95 transition-all ease-in-out duration-300"
            : "bg-white opacity-100 transition-all ease-in-out duration-300"
        } flex md:justify-around justify-between items-center h-24 shadow-md mx-auto px-6 md:px-2 text-primary fixed top-0 w-full md:w-full z-50`}
      >
        <div className="flex md:w-full justify-between md:justify-around  items-center">
          <div className="md:block hidden">
            <Link to={"/home"}>
              <img
                className="object-contain md:w-20 w-16 select-none pointer-events-none"
                src={logo}
                alt=""
              />
            </Link>
          </div>
          <div className="block md:hidden">
            <div className="dropdown dropdown-bottom ">
              <div tabIndex={0} role="button">
                <AiOutlineMenu size={25} />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
              >
                <li className="py-1">
                  <Link to={"/search/user"}>
                    <CiSearch className="text-primary" size={15} />
                    <span className="hover:text-primary "> Search a User</span>
                  </Link>
                </li>
                <li className="py-1">
                  <Link to={"/home"}>
                    <CiHome className="text-primary" size={15} />
                    <span className="hover:text-primary ">Home</span>
                  </Link>
                </li>
                <li className="py-1">
                  <Link to={"/faqs"}>
                    <CiCircleQuestion className="text-primary" size={15} />
                    <span className="hover:text-primary ">FAQs</span>
                  </Link>
                </li>
                <li className="py-1">
                  <button
                    onClick={handleLogoutConfirmation}
                    className="btn btn-error mx-auto btn-sm text-white w-28 "
                  >
                    Log-out
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-black ">
            <ul className="hidden text-xs lg:text-base lg:gap-5 md:flex">
              <Link to={"/marketplace"} className="border-r border-black pr-4">
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  Marketplace
                </li>
              </Link>
              <Link to={"/home"}>
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  Home
                </li>
              </Link>
              <Link to={"/sellers"}>
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  Sellers
                </li>
              </Link>
              <Link to={"/recipe"}>
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  Recipe
                </li>
              </Link>
              <Link to={"/chat"}>
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  Chats
                </li>
              </Link>
              <Link to={"/faqs"}>
                <li className="p-2 lg:p-3 hover:text-primary  hover:-translate-y-1 ease-in-out duration-300 transition-all">
                  FAQs
                </li>
              </Link>
            </ul>
          </div>

          <div className="md:flex gap-5 items-center hidden">
            <Link
              to="/search/user"
              className="btn btn-sm lg:flex hidden btn-primary"
            >
              <CiSearch />
              Search a User
            </Link>
            <Link
              to="/search/user"
              className="btn md:flex btn-xs lg:hidden hidden btn-primary"
            >
              <CiSearch />
              Search a User
            </Link>
          </div>
          <div className="md:dropdown md:flex px-3 py-1 rounded-lg shadow-primary shadow-sm  items-center hidden  dropdown-bottom dropdown-end dropdown-hover">
            <div tabIndex={0} role="button">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-14 h-14 object-cover border border-primary rounded-full"
                />
              ) : (
                <FaUserCircle
                  className="md:block hidden text-primary"
                  size={40}
                />
              )}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content items-center justify-center flex flex-col gap-2 z-[1] menu p-2 shadow bg-base-200 rounded-box w-36"
            >
              <Link to={"/myaccount"}>
                <button className="btn btn-primary btn-sm w-28  ">
                  Go to My Account
                </button>
              </Link>

              <button
                onClick={handleLogoutConfirmation}
                className="btn btn-error btn-sm text-white w-28 "
              >
                Log-out
              </button>
            </div>
            <div>
              <MdOutlineManageAccounts className="text-primary" size={30} />
            </div>
          </div>
        </div>

        <div className="block md:hidden">
          <Link to={"/home"}>
            <img
              className="object-contain md:w-20 w-16 select-none pointer-events-none"
              src={logo}
              alt=""
            />
          </Link>
        </div>
        <div className="flex gap-5 items-center md:hidden">
          <div className=" ">
            <Link to={"/myaccount"}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-8 h-8 border-2 border-primary object-cover rounded-full"
                />
              ) : (
                <FaUserCircle
                  className="block md:hidden text-white"
                  size={30}
                />
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="btm-nav md:hidden text-xs border-t border-gray-300 text-black z-40">
        <Link to="/marketplace" className="">
          <CiShop size={15} />
          <span className="btm-nav-label">Marketplace</span>
        </Link>
        <Link to="/sellers" className="">
          <LiaSearchLocationSolid size={15} />
          <span className="btm-nav-label">Sellers</span>
        </Link>
        <Link to="/recipe" className="">
          <CiForkAndKnife size={15} />
          <span className="btm-nav-label">Recipes</span>
        </Link>
        <Link to="/chat" className="">
          <CiChat1 size={15} />
          <span className="btm-nav-label">Chats</span>
        </Link>
      </div>
      <div>
        <button
          className={`${
            fix
              ? "fixed z-10 btn btn-circle duration-300 ease-in-out btn-primary bottom-20 md:bottom-10 right-8"
              : "fixed z-10 btn btn-circle duration-300 ease-in-out btn-primary bottom-20 md:bottom-10 right-8 hidden"
          } border border-white`}
          onClick={handleGoToTop}
        >
          <FaArrowAltCircleUp size={30} />
        </button>
      </div>
    </div>
  );
};

export default NavbarLogged;
