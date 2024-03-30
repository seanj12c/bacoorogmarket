import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams to access URL params
import {
  updateDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { useAuth } from "../../authContext";
import uploadload from "../../assets/loading.gif";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Chat = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the current authenticated user
  const { chatId } = useParams(); // Get chatId from URL params
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState(""); // State to hold the message text
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [lastMessages, setLastMessages] = useState({}); // State to hold last messages for each user

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
      if (chatId) {
        try {
          const chatDocRef = doc(firestore, "chats", chatId);
          const chatDocSnap = await getDoc(chatDocRef);
          if (chatDocSnap.exists()) {
            const chatData = chatDocSnap.data();
            const otherUserId = chatData.users.find(
              (id) => id !== currentUser.uid
            );
            const selectedUserData = users.find(
              (user) => user.id === otherUserId
            );
            setSelectedUser(selectedUserData);
            setMessages(chatData.messages || []);
          } else {
            setSelectedUser(null);
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
  }, [chatId, currentUser, users, unsubscribe]);

  useEffect(() => {
    const unsubscribeSnapshot = users.map((user) => {
      const chatId = [currentUser.uid, user.id].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);
      return onSnapshot(chatDocRef, (doc) => {
        const chatData = doc.data();
        const lastMessage = chatData?.messages?.[chatData.messages.length - 1];
        if (lastMessage) {
          setLastMessages((prevMessages) => ({
            ...prevMessages,
            [user.id]: lastMessage,
          }));
          if (lastMessage.recipientId === currentUser.uid) {
            // Check if the last message is directed to the current user
            toast.info(`${user.firstName} sent you a message`, {
              autoClose: 5000, // Automatically close the notification after 3 seconds
            });
          }
        }
      });
    });

    return () => {
      unsubscribeSnapshot.forEach((unsubscribe) => unsubscribe());
    };
  }, [users, currentUser]);

  const handleUserSelect = async (user) => {
    try {
      setSelectedUser(user);
      const chatId = [currentUser.uid, user.id].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);

      // Check if the chat document exists
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // If the document doesn't exist, create it
        await setDoc(chatDocRef, {
          users: [currentUser.uid, user.id],
          messages: [], // Initialize with an empty array of messages
        });
      }

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.trim());
  };

  const filteredUsers = users
    .filter((user) => {
      return (
        user.email !== "bacoorogmarket@gmail.com" &&
        (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      const lastMessageA = lastMessages[a.id];
      const lastMessageB = lastMessages[b.id];

      if (!lastMessageA && !lastMessageB) return 0; // No messages for both users
      if (!lastMessageA) return 1; // User A has no messages
      if (!lastMessageB) return -1; // User B has no messages

      // Sort by message timestamp in descending order
      return lastMessageB.timestamp - lastMessageA.timestamp;
    });

  // Add a function to update the last message state
  const updateLastMessage = (userId) => {
    setLastMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      delete updatedMessages[userId];
      return updatedMessages;
    });
  };

  const deleteConversation = async () => {
    try {
      if (selectedUser) {
        const chatId = [currentUser.uid, selectedUser.id].sort().join("");
        const chatDocRef = doc(firestore, "chats", chatId);
        await deleteDoc(chatDocRef); // Delete the conversation document
        console.log("Conversation deleted successfully!");
        setSelectedUser(null); // Clear the selected user after deleting conversation
        updateLastMessage(selectedUser.id); // Update last message state
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    handleSendMessage(); // Call the sendMessage function when the form is submitted
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
        <div className="px-4 md:pb-0 pb-20 pt-5 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-2xl text-center font-bold text-primary pt-24 mb-1">
            Chat
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
              <div className="flex  lg:flex-col gap-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`border object-cover p-4 rounded-lg cursor-pointer hover:bg-gray-200 ${
                      selectedUser && selectedUser.id === user.id
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex w-28 lg:w-full lg:flex-row flex-col gap-2 items-center">
                      <img
                        src={user.profilePhotoUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-9 h-9 object-cover rounded-full"
                      />
                      <div>
                        <h3 className="text-xs lg:text-lg font-bold text-center lg:text-start">
                          {user.firstName} {user.lastName}
                        </h3>
                        {lastMessages[user.id] && (
                          <p className="text-sm text-gray-500">
                            {lastMessages[user.id].senderId === currentUser.uid
                              ? "You: "
                              : `${user.firstName}: `}
                            {lastMessages[user.id].content.length > 7
                              ? lastMessages[user.id].content.substring(0, 7) +
                                "..."
                              : lastMessages[user.id].content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedUser ? (
              <div className="w-full border h-[400px] p-4 rounded-lg mb-4 lg:w-3/4 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex gap-2 items-center ">
                    <img
                      className="h-10 w-10 object-cover rounded-full"
                      src={selectedUser.profilePhotoUrl}
                      alt=""
                    />
                    <h2 className="font-bold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                  </div>
                  <div>
                    {messages.length > 0 && ( // Conditionally render the button
                      <button
                        className="btn btn-error text-white"
                        onClick={() =>
                          document.getElementById("deleteconvo").showModal()
                        }
                      >
                        Delete
                      </button>
                    )}
                    <dialog id="deleteconvo" className="modal">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">
                          Delete a Conversation
                        </h3>
                        <p className="py-4">
                          This message will be going to delete in the database.
                          So, {selectedUser.firstName} can also not be able to
                          see it anymore. Are you sure you want to delete this
                          conversation? This action cannot be undone.
                        </p>
                        <div className="modal-action">
                          <button
                            onClick={deleteConversation}
                            className="btn btn-error text-white"
                          >
                            Delete
                          </button>
                          <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>
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
                            } p-2  mb-1 w-full flex flex-col`}
                          >
                            <div className="flex items-center">
                              {message.senderId === currentUser.uid ? (
                                <>
                                  <img
                                    src={currentUser.profilePhotoUrl} // Displaying current user's profile photo
                                    alt={currentUser.firstName}
                                    className="w-8 h-8 hidden rounded-full mr-2"
                                  />
                                </>
                              ) : (
                                <>
                                  <img
                                    src={selectedUser.profilePhotoUrl} // Displaying selected user's profile photo
                                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                    className="w-8 h-8 object-cover rounded-full mr-2"
                                  />
                                </>
                              )}
                              <div className="">
                                <div>
                                  <h1
                                    className={`${
                                      message.senderId === currentUser.uid
                                        ? "chat-bubble-primary "
                                        : "chat-bubble-info"
                                    } chat-bubble max-w-xs text-base overflow-x-hidden break-all  md:max-w-lg`}
                                  >
                                    {message.content}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="skeleton h-10 w-full"></div>
                      <p className="text-gray-500 text-center">
                        There are no messages here. Why not start a
                        conversation?
                      </p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleFormSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={handleMessageChange}
                    className="w-full border rounded p-2 mr-2"
                  />
                  <button type="submit" className="btn btn-primary text-white">
                    Send
                  </button>
                </form>
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
