import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
            // Add more fields if needed
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

  const handleOptionsClick = (userId, user) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
    setSelectedUser(selectedUser === userId ? null : user);
  };

  const disableAccount = () => {
    if (selectedUser) {
      const { firstName, lastName, email } = selectedUser;
      if (
        window.confirm(
          `Are you sure you want to disable ${firstName} ${lastName} with an email of ${email} in the database?`
        )
      ) {
        // Implement disable account logic
        console.log("Disable account for user with ID:", selectedUserId);
      }
    }
  };

  const deleteAccount = () => {
    if (selectedUser) {
      const { firstName, lastName, email } = selectedUser;
      if (
        window.confirm(
          `Are you sure you want to delete ${firstName} ${lastName} with an email of ${email} in the database?`
        )
      ) {
        // Implement delete account logic
        console.log("Delete account for user with ID:", selectedUserId);
      }
    }
  };

  const closeOptions = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
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

              <div className="overflow-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No users found for "{searchQuery}". Please try a different
                    search.
                  </p>
                ) : (
                  <table className="mx-auto">
                    <thead>
                      <tr>
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
                          <td className="border px-4 py-2 text-xs text-center">
                            {user.userId}
                          </td>
                          <td className="border px-4 py-2 text-center text-xs">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="border px-4 py-2 text-center text-xs">
                            {user.email}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <div className="relative inline-block">
                              <BsThreeDotsVertical
                                size={20}
                                className="text-primary cursor-pointer"
                                onClick={() =>
                                  handleOptionsClick(user.userId, user)
                                }
                              />
                              {selectedUserId === user.userId && (
                                <div className="absolute top-[-40px] right-[-20px] z-10 bg-white p-2 shadow-md rounded-md mt-2">
                                  <button
                                    className="block w-full py-2 px-1 text-center bg-black text-white rounded-md text-xs hover:bg-gray-300 border border-gray-200 mt-2"
                                    onClick={disableAccount}
                                  >
                                    Disable
                                  </button>
                                  <button
                                    className="block w-full py-2 px-1 text-center bg-red-500 text-white rounded-md text-xs hover:bg-red-900 border border-gray-200 mt-2"
                                    onClick={deleteAccount}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="block w-full py-2 px-1 text-center rounded-md text-xs hover:bg-gray-200 border border-gray-200 mt-2"
                                    onClick={closeOptions}
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </div>
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
    </div>
  );
};

export default AdminUsers;
