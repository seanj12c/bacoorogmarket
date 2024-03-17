import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import uploadload from "../../assets/loading.gif";

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query and hide users with email "bacoorogmarket@gmail.com"
  const filteredUsers = users.filter((user) => {
    return (
      user.email !== "bacoorogmarket@gmail.com" &&
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.trim());
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
        <div className="px-4 pt-5 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-2xl text-center font-bold text-primary pt-24 mb-1">
            Choose a User to Chat With
          </h2>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full border rounded p-2 mb-3"
            />
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div
              className="w-full lg:w-1/3 overflow-y-auto"
              style={{ maxHeight: "400px" }}
            >
              <div className="flex flex-col gap-1">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border p-4 rounded-lg">
                    <div className="flex gap-2 items-center">
                      <img
                        src={user.profilePhotoUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <h3 className="text-lg font-bold">
                        {user.firstName} {user.lastName}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-2/3 flex flex-col justify-between">
              <div
                className="border h-80 p-4 rounded-lg mb-4"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              ></div>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full border rounded p-2 mr-2"
                />
                <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
