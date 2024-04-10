import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  updateDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase";
import { useAuth } from "../../authContext";
import uploadload from "../../assets/loading.gif";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Swal from "sweetalert2";

const Chat = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [lastMessages, setLastMessages] = useState({});

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
          .filter((user) => user.id !== currentUser.uid);
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

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

          const unsubscribe = onSnapshot(chatDocRef, (doc) => {
            const chatData = doc.data();
            setMessages(chatData?.messages || []);
          });
          setUnsubscribe(() => unsubscribe);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();

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
            toast.info(`${user.firstName} sent you a message`, {
              autoClose: 5000,
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

      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        await setDoc(chatDocRef, {
          users: [currentUser.uid, user.id],
          messages: [],
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

  const filteredUsers = users.filter((user) => {
    return (
      user.email !== "bacoorogmarket@gmail.com" &&
      user.firstName &&
      user.lastName &&
      user.email && // Check if these properties are defined
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const usersWithLastMessages = filteredUsers
    .filter((user) => lastMessages[user.id])
    .sort((a, b) => {
      const lastMessageA = lastMessages[a.id];
      const lastMessageB = lastMessages[b.id];

      return lastMessageB.timestamp - lastMessageA.timestamp;
    });

  const usersWithoutLastMessages = filteredUsers.filter(
    (user) => !lastMessages[user.id]
  );

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
        await deleteDoc(chatDocRef);
        console.log("Conversation deleted successfully!");
        setSelectedUser(null);
        updateLastMessage(selectedUser.id);
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
              timestamp: new Date(),
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
              timestamp: new Date(),
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
    setMessageText(e.target.value);
  };

  const handleSendMessage = () => {
    if (messageText.trim() === "") {
      return;
    }
    sendMessage(messageText);
    setMessageText("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleReportProfile = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: `Why do you want to report ${selectedUser.firstName}?`,
        input: "select",
        inputOptions: {
          Spam: "Spam",
          "Identity Theft": "Identity Theft",
          "Scamming/Bogus Buyer": "Scamming/Bogus Buyer",
          "Inappropriate Display Picture": "Inappropriate Display Picture",
          "Harassment or Bullying": "Harassment or Bullying",
          Others: "Others",
        },
        inputValidator: (value) => {
          if (!value) {
            return "You need to select a reason";
          }
        },
        inputPlaceholder: "Select a reason",
        inputAttributes: {
          autocapitalize: "off",
          style: "border: 1px solid #ccc; border-radius: 5px; padding: 5px;",
        },
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#008080",
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        html: `
          <label for="file" class="text-sm">Upload a photo as proof (Required)</label>
          <input type="file" id="file" accept="image/*" class="file-input file-input-bordered file-input-primary w-full max-w-xs my-2"/>
          <textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Explain why"></textarea>
        `,
        preConfirm: async () => {
          const file = document.getElementById("file").files[0];
          const reason = Swal.getPopup().querySelector(".swal2-select").value;
          const explanation =
            Swal.getPopup().querySelector("#swal-input2").value;

          if (!file || !reason || !explanation) {
            Swal.showValidationMessage("Please fill out all fields");
            return;
          }

          try {
            const randomFileName = Math.random().toString(36).substring(2);
            const storageRef = ref(
              storage,
              `profileReports/${selectedUser.userId}/${randomFileName}`
            );
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            const reportData = {
              reason,
              explanation,
              userId: selectedUser.userId,
              timestamp: serverTimestamp(),
              photoUrl: fileUrl,
            };

            await addDoc(collection(firestore, "profileReports"), reportData);

            Swal.fire({
              title: "Report Submitted!",
              text: "Thank you for your report. Our team will review it.",
              icon: "success",
            });
          } catch (error) {
            console.error("Error uploading photo:", error);
            Swal.fire(
              "Error!",
              "An error occurred while uploading the photo.",
              "error"
            );
          }
        },
      });

      if (!reason) {
        Swal.fire({
          title: "Cancelled",
          text: "Your report has been cancelled",
          icon: "error",
          confirmButtonColor: "#008080",
        });
      }
    } catch (error) {
      console.error("Error reporting profile:", error);
      Swal.fire(
        "Error!",
        "An error occurred while reporting the profile.",
        "error"
      );
    }
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
              <div className="flex lg:flex-col gap-1">
                {usersWithLastMessages.map((user) => (
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

                {searchQuery === ""
                  ? // Display only the first three users without last messages
                    usersWithoutLastMessages.slice(0, 3).map((user) => (
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
                            <p className="text-sm italic text-primary">
                              Suggested User
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  : // Display all filtered users
                    usersWithoutLastMessages
                      .filter(
                        (user) =>
                          user.firstName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          user.lastName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          user.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
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
                  <div className="flex flex-col md:flex-row gap-2">
                    {messages.length > 0 && (
                      <button
                        onClick={handleReportProfile}
                        className="btn md:btn-md btn-xs btn-error text-white"
                      >
                        Report
                      </button>
                    )}
                    {messages.length > 0 && ( // Conditionally render the button
                      <button
                        className="btn  md:btn-md btn-xs btn-error text-white"
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
