import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../authContext";
import { firestore } from "../../firebase";
import { useNavigate } from "react-router-dom"; // Import useHistory hook

const SearchAUser = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // Initialize useHistory hook

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const registeredCollection = collection(firestore, "registered");
        const querySnapshot = await getDocs(registeredCollection);
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      !user.isDeactivated &&
      user.id !== currentUser.uid &&
      (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const limitedUsers = filteredUsers.slice(0, 4); // Limit to the first three users

  // Function to handle click on user div
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`); // Navigate to /profile/userId
  };

  return (
    <div className="container py-28 mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Search Users</h2>
      <input
        type="text"
        placeholder="Search by name or address"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {limitedUsers.map((user, index) => (
          <div
            key={user.id}
            className="border p-4 rounded-sm cursor-pointer hover:shadow-md transition duration-300 ease-in-out"
            onClick={() => handleUserClick(user.id)} // Call handleUserClick on click
          >
            <img
              src={user.profilePhotoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-36 rounded-sm object-cover mb-2"
            />
            <p className="font-bold">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-gray-500 text-xs">{user.address}</p>
            {!searchQuery && (
              <p className="text-primary font-semibold">Suggested User</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchAUser;
