import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import uploadload from "../../assets/loading.gif";
import { AiOutlineLogout } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  MdNoAccounts,
  MdOutlineReport,
  MdOutlineRestaurantMenu,
} from "react-icons/md";
import { FaFile, FaSearch, FaUsers } from "react-icons/fa";
import { GiMussel } from "react-icons/gi";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAuth, signOut } from "firebase/auth";
import NavbarAdmin from "./NavbarAdmin";
import logo from "../../assets/logo.png";

const AdminDeletedAccountInfo = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      const db = getFirestore();
      const accountsRef = collection(db, "registered");
      const q = query(accountsRef, where("isDeleted", "==", true));
      const snapshot = await getDocs(q);
      const accountsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.email !== "bacoorogmarket@gmail.com" &&
          data.firstName &&
          data.lastName
        ) {
          accountsData.push(data);
        }
      });
      setAccounts(accountsData);
      setLoading(false);
    };

    fetchAccounts();
  }, []);

  const navigate = useNavigate();

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

  const goToInfo = (userId) => {
    navigate(`/admin/info/user/${userId}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAccounts = accounts.filter((account) =>
    `${account.firstName} ${account.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
              users="bg-white text-primary "
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
              deletions="bg-white text-primary"
              accinfos="bg-primary text-white"
            />
          </div>
          <div className="md:flex md:flex-row">
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
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
                    <GiMussel size={25} className="" />
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
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineReport size={25} />
                    Reports
                  </li>
                </Link>
                <Link to="/admin/delete/user">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <RiDeleteBin6Line size={25} />
                    Deletion Requests
                  </li>
                </Link>
                <Link to="/admin/delete/info">
                  <li className="bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <MdNoAccounts size={25} />
                    Deleted Acc Info
                  </li>
                </Link>
                <li
                  onClick={handleLogoutConfirmation}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>

            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                Deleted Account Information
              </h1>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden  sm:rounded-lg">
                  <div className="p-6 bg-white">
                    <div className="border-primary mb-2 border w-full  px-2 flex items-center gap-2 rounded-md ">
                      <FaSearch size={20} className="text-primary" />
                      <input
                        type="text"
                        placeholder="Search for Caption/Name..."
                        className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAccounts.map((account, index) => (
                        <div
                          key={index}
                          onClick={() => goToInfo(account.userId)}
                          className="p-6 bg-white border border-gray-200 rounded-md shadow-md"
                        >
                          <img
                            src={account.profilePhotoUrl}
                            alt="Profile"
                            className="w-20 h-20 object-cover border border-primary rounded-full mx-auto"
                          />
                          <h2 className="text-lg text-center font-semibold mb-2">
                            {account.firstName} {account.lastName}
                          </h2>
                          <p className="text-xs text-gray-500 mb-2">
                            Address: {account.address}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            Contact: {account.contact}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            Email: {account.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeletedAccountInfo;
