import React, { useEffect, useState } from "react";
import {
  updateDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { useAuth } from "../../authContext";
import uploadload from "../../assets/loading.gif";

const Chat = () => {
  const { currentUser } = useAuth(); // Get the current authenticated user
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState(""); // State to hold the message text
  const [unsubscribe, setUnsubscribe] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const registeredCollection = collection(firestore, "registered");
        const querySnapshot = await getDocs(registeredCollection);
        const userData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Filter out the authenticated user from the list of users
          .filter((user) => user.id !== currentUser.uid);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]); // Fetch users whenever the currentUser changes

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const chatId = [currentUser.uid, selectedUser.id].sort().join("");
          const chatDocRef = doc(firestore, "chats", chatId);
          const chatDocSnap = await getDoc(chatDocRef);
          if (chatDocSnap.exists()) {
            const chatData = chatDocSnap.data();
            setMessages(chatData.messages || []);
          } else {
            setMessages([]);
          }

          // Subscribe to realtime updates
          const unsubscribe = onSnapshot(chatDocRef, (doc) => {
            const chatData = doc.data();
            setMessages(chatData?.messages || []); // Use optional chaining to handle undefined
          });
          setUnsubscribe(() => unsubscribe);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages(); // Call the fetchMessages function

    // Unsubscribe from snapshot listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedUser, currentUser, unsubscribe]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.trim());
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.email !== "bacoorogmarket@gmail.com" &&
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const sendMessage = async (messageContent) => {
    try {
      console.log("Sending message:", messageContent);

      const chatId = [currentUser.uid, selectedUser.id].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);

      const chatDocSnap = await getDoc(chatDocRef);
      if (chatDocSnap.exists()) {
        await updateDoc(chatDocRef, {
          messages: [
            ...chatDocSnap.data().messages,
            {
              senderId: currentUser.uid,
              recipientId: selectedUser.id,
              content: messageContent,
              timestamp: new Date(), // Change to current date
            },
          ],
        });
      } else {
        await setDoc(chatDocRef, {
          users: [currentUser.uid, selectedUser.id],
          messages: [
            {
              senderId: currentUser.uid,
              recipientId: selectedUser.id,
              content: messageContent,
              timestamp: new Date(), // Change to current date
            },
          ],
        });
      }

      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMessageChange = (e) => {
    setMessageText(e.target.value); // Update the message text as the user types
  };

  const handleSendMessage = () => {
    if (messageText.trim() === "") {
      // Check if the message text is empty or contains only whitespace
      return;
    }
    sendMessage(messageText); // Call sendMessage with the message text
    setMessageText(""); // Clear the message input after sending
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
              className="w-full lg:w-1/4 overflow-y-auto"
              style={{ maxHeight: "400px" }}
            >
              <div className="flex flex-col gap-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border p-4 rounded-lg cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
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
            {selectedUser ? (
              <div className="w-full border h-[400px] p-4 rounded-lg mb-4 lg:w-3/4 flex flex-col justify-between">
                <h2>Conversation with {selectedUser.firstName}</h2>
                <div
                  className=""
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {messages.length > 0 ? (
                    <div
                      className=""
                      style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      {messages.map((message, index) => (
                        <div key={index} className=" w-full">
                          <div
                            className={`${
                              message.senderId === currentUser.uid
                                ? "chat chat-end "
                                : "chat chat-start "
                            } p-2  mb-2 w-full flex flex-col`}
                          >
                            <div className="chat-header">
                              {message.senderId === currentUser.uid
                                ? "You"
                                : selectedUser.firstName}
                            </div>
                            <div
                              className={`${
                                message.senderId === currentUser.uid
                                  ? "chat-bubble-primary "
                                  : "chat-bubble-info"
                              } chat-bubble`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      There are no messages here. Why not start a conversation?
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={handleMessageChange}
                    className="w-full border rounded p-2 mr-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full border h-[400px] items-center p-4 rounded-lg mb-4 lg:w-3/4 grid justify-center">
                <h2 className="text-center text-gray-500">
                  Select user to open a conversation
                </h2>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
