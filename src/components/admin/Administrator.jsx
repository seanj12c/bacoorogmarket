import React, { useState, useEffect } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { getAuth, listUsers } from "firebase/auth";

const Administrator = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase Auth
    const auth = getAuth();

    // Fetch the list of users from Firebase
    listUsers(auth)
      .then((userRecords) => {
        const usersData = userRecords.map((user) => ({
          uid: user.uid,
          email: user.email,
          // Add more user data fields here as needed
        }));
        setUsers(usersData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full">
      <NavbarAdmin />
      <div className="pt-24 h-screen w-full">
        <div className="h-full pt-2 bg-bgray">
          <h1 className="text-primary text-center font-bold text-lg">
            User Management
          </h1>
          <div className="flex flex-col mt-6">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        {/* Add more table headers for additional user data */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.uid}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.uid}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          {/* Add more table cells for additional user data */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Administrator;
