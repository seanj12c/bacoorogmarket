import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getDownloadURL, ref, getStorage } from "firebase/storage";
import { useAuth } from "../../authContext";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

export const NavbarLogged = () => {
  const [nav, setNav] = useState(false);
  const [fix, setFix] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  const auth = useAuth();

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
    const storage = getStorage();
    const imageRef = ref(storage, `users/${userId}/profile.jpg`);
    return getDownloadURL(imageRef);
  };

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
        <div className="flex lg:w-full justify-between lg:justify-around  items-center">
          <div className="lg:block hidden">
            <Link to={"/home"}>
              <img
                className="object-contain lg:w-20 w-16 select-none pointer-events-none"
                src={logo}
                alt=""
              />
            </Link>
          </div>
          <div onClick={handleNav} className="block lg:hidden">
            {nav ? <AiOutlineMenu size={25} /> : <AiOutlineMenu size={25} />}
          </div>

          <div className="text-black">
            <ul className="hidden text-base gap-5 lg:flex">
              <Link to={"/marketplace"} className="border-r border-black pr-4">
                <li className="p-3 hover:text-primary">Marketplace</li>
              </Link>
              <Link to={"/home"}>
                <li className="p-3 hover:text-primary">Home</li>
              </Link>
              <Link to={"/about"}>
                <li className="p-3 hover:text-primary">About</li>
              </Link>
              <Link to={"/recipe"}>
                <li className="p-3 hover:text-primary">Recipe</li>
              </Link>
              <Link to={"/chat"}>
                <li className="p-3 hover:text-primary">Chat</li>
              </Link>
              <Link to={"/faqs"}>
                <li className="p-3 hover:text-primary">FAQs</li>
              </Link>
            </ul>
          </div>
          <div className="lg:flex hidden gap-2 items-center text-black border p-2 rounded-lg">
            <input
              type="text"
              placeholder="Search.."
              className="outline-none w-44"
            ></input>
            <AiOutlineSearch className="lg:block hidden text-black" size={20} />
          </div>

          <div className="lg:flex gap-5 items-center hidden">
            <Link to={"/myaccount"}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-12 h-12 object-cover rounded-full"
                />
              ) : (
                <FaUserCircle
                  className="lg:block hidden text-primary"
                  size={40}
                />
              )}
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
          <ul className="text-left pl-6 pr-14 flex flex-col gap-4 h-full mt-6">
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
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 mt-4 rounded-lg hover-bg-red-600 focus:outline-none"
            >
              Logout
            </button>
          </ul>
        </div>

        <div className="block lg:hidden">
          <Link to={"/home"}>
            <img
              className="object-contain lg:w-20 w-16 select-none pointer-events-none"
              src={logo}
              alt=""
            />
          </Link>
        </div>
        <div className="flex gap-5 items-center lg:hidden">
          <div>
            <Link to={"/myaccount"}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-8 h-8 object-cover rounded-full"
                />
              ) : (
                <FaUserCircle
                  className="block lg:hidden text-primary"
                  size={30}
                />
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarLogged;
