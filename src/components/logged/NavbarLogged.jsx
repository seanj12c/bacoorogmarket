import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
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
} from "react-icons/ci";
import LogoutModal from "../authentication/LogoutModal";
import { MdOutlineManageAccounts } from "react-icons/md";
import { LiaSearchLocationSolid } from "react-icons/lia";

export const NavbarLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleNav = () => {
    setNav(!nav);
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
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
          <div onClick={handleNav} className="block md:hidden">
            {nav ? <AiOutlineMenu size={25} /> : <AiOutlineMenu size={25} />}
          </div>

          <div className="text-black ">
            <ul className="hidden text-base lg:gap-5 md:gap-2 md:flex">
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

          <div className="md:flex gap-5 items-center hidden"></div>
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
                onClick={toggleLogoutModal}
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

        <div
          className={
            nav
              ? "fixed left-0 top-0 w-[80%] h-full shadow shadow-primary bg-[#ffffff] ease-in-out duration-500"
              : "fixed left-[-100%]"
          }
        >
          <div
            onClick={handleNav}
            className="flex pl-6 pt-9 justify-start md:hidden"
          >
            {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
          </div>
          <div className="flex flex-col gap-28">
            <div>
              <ul className="text-left text-black pl-6 pr-14 flex flex-col gap-4 h-full mt-6">
                <Link to={"/marketplace"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <CiShop size={30} className="text-primary" />
                    Marketplace
                  </li>
                </Link>
                <Link to={"/home"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <CiHome size={30} className="text-primary" />
                    Home
                  </li>
                </Link>
                <Link to={"/sellers"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <LiaSearchLocationSolid
                      size={30}
                      className="text-primary"
                    />
                    Sellers
                  </li>
                </Link>
                <Link to={"/recipe"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <CiForkAndKnife size={30} className="text-primary" />
                    Recipe
                  </li>
                </Link>
                <Link to={"/chat"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <CiChat1 size={30} className="text-primary" />
                    Chats
                  </li>
                </Link>
                <Link to={"/faqs"} onClick={handleNav}>
                  <li className=" hover:text-primary flex gap-2 items-center">
                    <CiCircleQuestion size={30} className="text-primary" />
                    FAQs
                  </li>
                </Link>
              </ul>
            </div>
            <div className="text-left  text-black pl-6 pr-14 flex flex-col gap-4 h-full mt-6">
              <div className="border-t-gray-500 border-t"></div>
              <button
                onClick={toggleLogoutModal}
                className="btn btn-error w-full text-white "
              >
                Logout
              </button>
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

      <div className="btm-nav text-xs border-t border-gray-300 text-black z-40">
        <button className="">
          <CiHome size={15} />
          <span className="btm-nav-label">Marketplace</span>
        </button>{" "}
        <button className="">
          <LiaSearchLocationSolid size={15} />
          <span className="btm-nav-label">Sellers</span>
        </button>{" "}
        <button className="">
          <CiForkAndKnife size={15} />
          <span className="btm-nav-label">Recipes</span>
        </button>{" "}
        <button className="">
          <CiChat1 size={15} />
          <span className="btm-nav-label">Chats</span>
        </button>
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
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default NavbarLogged;
