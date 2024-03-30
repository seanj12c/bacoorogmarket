import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";

import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";
import LogoutModal from "../authentication/LogoutModal";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const usersCollection = collection(firestore, "registered");
    const usersQuery = query(usersCollection, orderBy("userId", "desc"));

    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if the user ID and email match the specific values to be filtered out
        if (
          data.userId !== "z3YwfbkrJiWPGOW8U8on8kUMYlO2" &&
          data.email !== "bacoorogmarket@gmail.com"
        ) {
          usersData.push({
            id: doc.id,
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            disabled: data.disabled || false,
          });
        }
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const enableAccount = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to ENABLE ${user.firstName} ${user.lastName} with an email of ${user.email} in the database?`
      )
    ) {
      const userRef = doc(firestore, "registered", user.id);
      await updateDoc(userRef, {
        disabled: false,
      });
      window.alert(`User ${user.firstName}  enabled!`);
    }
  };

  const disableAccount = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to DISABLE ${user.firstName} ${user.lastName} with an email of ${user.email} in the database?`
      )
    ) {
      const userRef = doc(firestore, "registered", user.id);
      await updateDoc(userRef, {
        disabled: true,
      });
      window.alert(`User ${user.firstName}  disabled!`);
    }
  };

  const deleteAccount = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName} with an email of ${user.email} from the database?`
      )
    ) {
      try {
        const userRef = doc(firestore, "registered", user.id);
        await deleteDoc(userRef);
        window.alert(`User deleted!`);
      } catch (error) {
        window.alert(`Error deleting user!`);
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    return (
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const navigate = useNavigate();

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
              users="bg-primary text-white "
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
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
                  <li className=" bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <FaUsers size={25} className="text-white" />
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
                <li
                  onClick={toggleLogoutModal}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>
            {/* User Management Table */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                User Management
              </h1>
              <div className="py-5">
                <input
                  type="text"
                  placeholder="Search for ID/Name/Email..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <h1 className="text-center pb-2 text-primary underline text-xs lg:hidden">
                  Swipe left & right to view other data
                </h1>
              </div>

              <div className="overflow-y-auto max-h-[450px]">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No users found for "{searchQuery}". Please try a different
                    search.
                  </p>
                ) : (
                  <table className="mx-auto table table-xs border-collapse">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-4 py-2 text-xs text-center">
                          User ID
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Name
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Email
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-xs text-center">
                            {user.userId}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {user.email}
                          </td>
                          <td className="border bg-gray-200  flex gap-2 px-4 py-2 text-center">
                            {user.disabled ? (
                              <button
                                className="block w-full py-2 px-1 text-center bg-green-500 text-white rounded-md text-xs hover:bg-green-700 border border-gray-200 mt-2"
                                onClick={() => enableAccount(user)}
                              >
                                Enable
                              </button>
                            ) : (
                              <button
                                className="block w-full py-2 px-1 text-center bg-black text-white rounded-md text-xs hover:bg-gray-800 border border-gray-200 mt-2"
                                onClick={() => disableAccount(user)}
                              >
                                Disable
                              </button>
                            )}
                            <button
                              className="block w-full py-2 px-1 text-center bg-red-500 text-white rounded-md text-xs hover:bg-red-900 border border-gray-200 mt-2"
                              onClick={() => deleteAccount(user)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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

export default AdminUsers;
