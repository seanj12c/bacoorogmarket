import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";
import LogoutModal from "../authentication/LogoutModal";

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [appeals, setAppeals] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const db = getFirestore();
        const appealRef = collection(db, "userAppeal");
        const snapshot = await getDocs(appealRef);
        const appealData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            if (doc.id !== "sample") {
              const userData = await getUserData(doc.data().userId);
              return {
                id: doc.id,
                email: doc.data().email,
                reason: doc.data().reason,
                userData: userData,
              };
            }
            return null;
          })
        );
        setAppeals(appealData.filter((appeal) => appeal !== null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appeals:", error);
      }
    };

    fetchAppeals();
  }, []);

  const getUserData = async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "registered", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("No such user document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
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

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto"
            src={uploadload}
            alt=""
          />
        </div>
      ) : (
        <div className="h-screen md:pt-0 pt-24 w-full">
          <div className="md:hidden">
            <NavbarAdmin
              users="bg-white text-primary"
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-primary text-white "
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-28 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-2xl lg:text-3xl">
                  Admin Panel
                </h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-6">
                <Link to="/admin/users">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaUsers size={25} />
                    Users
                  </li>
                </Link>
                <Link to="/admin/locations">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <LiaSearchLocationSolid size={25} className="" />
                    Locations
                  </li>
                </Link>
                <Link to="/admin/products">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <GiMussel size={25} />
                    Products
                  </li>
                </Link>
                <Link to="/admin/recipes">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineRestaurantMenu size={25} />
                    Recipes
                  </li>
                </Link>
                <Link to="/admin/appeal">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaFile size={25} />
                    Appeal
                  </li>
                </Link>
                <Link to="/admin/reports">
                  <li className=" bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <MdOutlineReport size={25} />
                    Reports
                  </li>
                </Link>
                <li
                  onClick={toggleLogoutModal}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>
            {/* Appeals List */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h2 className="text-2xl font-bold mt-8">Appeals</h2>
              <ul className="mt-4">
                {appeals.map((appeal) => (
                  <li key={appeal.id} className="card glass rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      {appeal.userData && (
                        <div className="flex items-center gap-2">
                          <img
                            src={appeal.userData.profilePhotoUrl}
                            alt="Profile"
                            className="md:w-14 md:h-14 border border-primary w-10 h-10 rounded-full object-cover inline-block ml-2"
                          />{" "}
                          {appeal.userData.firstName} {appeal.userData.lastName}
                        </div>
                      )}
                      <button className="btn btn-primary btn-xs md:btn-md text-white">
                        Enable
                      </button>
                    </div>
                    <div>
                      <strong>Email:</strong> {appeal.email}
                    </div>
                    <div>
                      <strong>Reason:</strong> {appeal.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default AdminReports;
