import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  updateDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase";
import { useAuth } from "../../authContext";
import uploadload from "../../assets/loading.gif";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import Swal from "sweetalert2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AiOutlinePicture } from "react-icons/ai";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const chatRef = useRef();

  useEffect(() => {
    chatRef.current?.scrollIntoView();
  }, [messages]);

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
          if (
            !user.isDeactivated &&
            !user.isDeleted &&
            user.firstName &&
            user.lastName
          ) {
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [user.id]: lastMessage,
            }));
            if (
              lastMessage.recipientId === currentUser.uid &&
              !lastMessage.read
            ) {
              toast.info(`${user.firstName} sent you a message`, {
                autoClose: 3000,
              });
            }
          } else {
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [user.id]: lastMessage,
            }));
            if (
              lastMessage.recipientId === currentUser.uid &&
              !lastMessage.read
            ) {
              toast.info(`User sent you a message`, {
                autoClose: 3000,
              });
            }
          }
        }
      });
    });

    return () => {
      unsubscribeSnapshot.forEach((unsubscribe) => unsubscribe());
    };
  }, [users, currentUser]);

  const openPhotoModal = (photoUrl) => {
    Swal.fire({
      imageUrl: photoUrl,
      imageAlt: "Full screen photo",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        image: "custom-class-name",
        closeButton: "btn btn-error btn-circle text-white",
      },
      onClose: () => {},
    });
  };

  const handleUserSelect = async (user) => {
    try {
      Swal.fire({
        title: "Loading...",
        timer: 2000,
        allowOutsideClick: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });

      setSelectedUser(user);
      const chatId = [currentUser.uid, user.id].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);

      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        await setDoc(chatDocRef, {
          users: [currentUser.uid, user.id],
          messages: [],
        });
      } else {
        const messages = chatDocSnap.data().messages || [];
        messages.forEach((message) => {
          if (message.senderId === user.id && !message.read) {
            message.read = true;
          }
        });

        await updateDoc(chatDocRef, { messages });
      }

      navigate(`/chat/${chatId}`);

      setTimeout(() => {
        navigate("/chat");
        Swal.close();
      }, 2000);
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
      user.email &&
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

  const addDeleteFlag = async (userId, chatId) => {
    try {
      const chatDocRef = doc(firestore, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);
      if (chatDocSnap.exists()) {
        const chatData = chatDocSnap.data();
        if (chatData && chatData.messages && Array.isArray(chatData.messages)) {
          const updatedMessages = chatData.messages.map((message) => {
            if (!message.isDelete) {
              message.isDelete = [userId];
            } else if (!message.isDelete.includes(userId)) {
              message.isDelete.push(userId);
            }
            return message;
          });

          await updateDoc(chatDocRef, { messages: updatedMessages });
          console.log("Delete flag added to messages successfully!");
        } else {
          console.log("No messages found in the conversation.");
        }
      } else {
        console.log("Conversation document does not exist.");
      }
    } catch (error) {
      console.error("Error adding delete flag to messages:", error);
    }
  };

  const deleteConversation = async () => {
    try {
      if (selectedUser) {
        setIsDeleting(true);
        const chatId = [currentUser.uid, selectedUser.id].sort().join("");
        await addDeleteFlag(currentUser.uid, chatId);
        setSelectedUser(null);
        updateLastMessage(selectedUser.id);

        document.getElementById("deleteconvo").close();

        Swal.fire({
          icon: "success",
          title: "Deleted",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const randomChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomFilename = "";
      for (let i = 0; i < 10; i++) {
        randomFilename += randomChars.charAt(
          Math.floor(Math.random() * randomChars.length)
        );
      }
      const timestamp = new Date().getTime();
      const filename = `${randomFilename}_${timestamp}`;

      const storage = getStorage();
      const storageRef = ref(storage, `photos/${filename}`);

      uploadBytes(storageRef, file).then((snapshot) => {
        console.log("Uploaded a file:", snapshot);

        getDownloadURL(snapshot.ref)
          .then((downloadURL) => {
            sendMessage(messageText, downloadURL);
            setPhotoPreview(null);
            setIsUploading(false);
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setIsUploading(false);
          });
      });
    }
  };

  const sendMessage = async (messageContent, photoUrl) => {
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
              photo: photoUrl,
              timestamp: new Date(),
              read: false,
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
              photo: photoUrl,
              timestamp: new Date(),
              read: false,
            },
          ],
        });
      }

      console.log("Message sent successfully!");
      navigate("/chat");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() === "") {
      return;
    }
    sendMessage(messageText, photoPreview);
    setMessageText("");
    setPhotoPreview(null);
  };

  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleReportProfile = async () => {
    try {
      const { value: reason } = await Swal.fire({
        title: `Why do you want to report ${
          selectedUser.isDeactivated || selectedUser.isDeleted
            ? "this user"
            : selectedUser.firstName
        }?`,

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
        <div className="px-4 md:pb-0 pb-24 pt-5 sm:px-6 md:px-8 lg:px-10">
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
              style={{ maxHeight: "500px" }}
            >
              <div className="flex lg:flex-col gap-1">
                {usersWithLastMessages.map((user) => (
                  <div
                    key={user.id}
                    className={`border object-cover rounded-lg cursor-pointer hover:bg-gray-200 ${
                      selectedUser && selectedUser.id === user.id
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex justify-end ">
                      <span className="indicator-item badge badge-primary">
                        <p className=" text-xs">{user.role}</p>
                      </span>
                    </div>
                    <div className="flex w-28  pb-4 px-4 lg:w-full lg:flex-row flex-col gap-2 items-center">
                      <img
                        src={
                          user.isDeactivated || user.isDeleted
                            ? "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b"
                            : user.profilePhotoUrl
                        }
                        alt={
                          user.isDeactivated || user.isDeleted
                            ? "User"
                            : `${user.firstName} ${user.lastName}`
                        }
                        className="w-9 h-9 object-cover rounded-full"
                      />

                      <div className="flex flex-col gap-1 items-start">
                        <h3 className="text-xs lg:text-lg font-bold lg:text-start">
                          {user.isDeactivated || user.isDeleted
                            ? ""
                            : user.firstName}{" "}
                          {user.isDeactivated || user.isDeleted
                            ? "User"
                            : user.lastName}
                        </h3>
                        {lastMessages[user.id] ? (
                          lastMessages[user.id].isDelete?.includes(
                            currentUser.uid
                          ) ? (
                            <p className="md:text-sm text-xs text-gray-500">
                              Deleted Messages
                            </p>
                          ) : (
                            <>
                              <p className="md:text-sm text-xs text-gray-500">
                                {lastMessages[user.id].senderId ===
                                currentUser.uid
                                  ? "You: "
                                  : `${
                                      user.isDeleted || user.isDeactivated
                                        ? "User"
                                        : user.firstName
                                    }: `}
                                {lastMessages[user.id].content.length > 0
                                  ? lastMessages[user.id].content.length > 7
                                    ? lastMessages[user.id].content.substring(
                                        0,
                                        7
                                      ) + "..."
                                    : lastMessages[user.id].content
                                  : "Sent a photo."}
                              </p>
                              {!lastMessages[user.id].read &&
                                lastMessages[user.id].recipientId ===
                                  currentUser.uid && (
                                  <div className="flex justify-center w-full md:justify-start">
                                    <span className="indicator-item badge badge-primary">
                                      Unread
                                    </span>
                                  </div>
                                )}
                            </>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                {searchQuery === ""
                  ? usersWithoutLastMessages
                      .slice(0, 3)
                      .filter((user) => !user.isDeactivated || !user.isDeleted)
                      .map((user) => (
                        <div
                          key={user.id}
                          className={`border object-cover rounded-lg cursor-pointer hover:bg-gray-200 ${
                            selectedUser && selectedUser.id === user.id
                              ? "bg-gray-200"
                              : ""
                          }${
                            user.isDeactivated || user.isDeleted ? "hidden" : ""
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="flex justify-end ">
                            <span className="indicator-item badge badge-primary">
                              <p className=" text-xs">{user.role}</p>
                            </span>
                          </div>

                          <div className="flex pb-4 px-4 w-28 lg:w-full lg:flex-row flex-col gap-2 items-center">
                            <img
                              src={
                                user.isDeactivated || user.isDeleted
                                  ? "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b"
                                  : user.profilePhotoUrl
                              }
                              alt={
                                user.isDeactivated || user.isDeleted
                                  ? "User"
                                  : `${user.firstName} ${user.lastName}`
                              }
                              className="w-9 h-9 object-cover rounded-full"
                            />
                            <div>
                              <h3 className="text-xs lg:text-lg font-bold text-center lg:text-start">
                                {user.isDeactivated || user.isDeleted
                                  ? "User"
                                  : `${user.firstName} ${user.lastName}`}
                              </h3>
                              <p className="text-xs md:text-sm text-center md:text-start italic text-primary">
                                {user.isDeactivated || user.isDeleted
                                  ? ""
                                  : "Suggested User"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  : usersWithoutLastMessages
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
                              src={
                                user.isDeactivated || user.isDeleted
                                  ? "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b"
                                  : user.profilePhotoUrl
                              }
                              alt={
                                user.isDeactivated || user.isDeleted
                                  ? "User"
                                  : `${user.firstName} ${user.lastName}`
                              }
                              className="w-9 h-9 object-cover rounded-full"
                            />
                            <div>
                              <h3 className="text-xs lg:text-lg font-bold text-center lg:text-start">
                                {user.isDeactivated || user.isDeleted
                                  ? " "
                                  : user.firstName}{" "}
                                {user.isDeactivated || user.isDeleted
                                  ? "User"
                                  : user.lastName}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
              </div>
            </div>

            {selectedUser ? (
              <div className="w-full border h-[500px] p-4 rounded-lg mb-4 lg:w-3/4 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex gap-2 items-center ">
                    <img
                      className="h-10 w-10 object-cover rounded-full"
                      src={
                        selectedUser.isDeactivated || selectedUser.isDeleted
                          ? "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b"
                          : selectedUser.profilePhotoUrl
                      }
                      alt=""
                    />
                    <div>
                      <h2 className="font-bold">
                        {selectedUser.isDeactivated || selectedUser.isDeleted
                          ? " "
                          : selectedUser.firstName}{" "}
                        {selectedUser.isDeactivated || selectedUser.isDeleted
                          ? "User"
                          : selectedUser.lastName}
                      </h2>
                      <h1 className="text-primary  text-xs">
                        {selectedUser.role}
                      </h1>
                    </div>
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
                    {messages.length > 0 && (
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
                          Are you sure you want to delete your conversation with{" "}
                          <span className="font-bold">
                            {selectedUser.isDeactivated ||
                            selectedUser.isDeleted
                              ? "User"
                              : selectedUser.firstName}
                          </span>
                          ? This action cannot be undone.
                        </p>
                        <div className="modal-action">
                          <button
                            onClick={deleteConversation}
                            className={`btn btn-error text-white flex items-center justify-center ${
                              isDeleting ? "cursor-not-allowed opacity-50" : ""
                            }`}
                          >
                            {isDeleting ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              <span>Delete</span>
                            )}
                          </button>
                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>
                <div
                  className=""
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {messages.length > 0 ? (
                    <div className="">
                      {messages.some(
                        (message) =>
                          !message.isDelete?.includes(currentUser.uid)
                      ) ? (
                        messages
                          .filter(
                            (message) =>
                              !message.isDelete?.includes(currentUser.uid)
                          )
                          .map((message, index) => (
                            <div ref={chatRef} key={index} className="w-full">
                              <div
                                className={`${
                                  message.senderId === currentUser.uid
                                    ? "chat chat-end "
                                    : "chat chat-start "
                                } p-2 mb-1 w-full flex flex-col`}
                              >
                                <div className="flex items-center">
                                  {message.senderId === currentUser.uid ? (
                                    <>
                                      <img
                                        src={currentUser.profilePhotoUrl}
                                        alt={currentUser.firstName}
                                        className="w-8 h-8 hidden rounded-full mr-2"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <img
                                        src={
                                          selectedUser.isDeactivated ||
                                          selectedUser.isDeleted
                                            ? "https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b"
                                            : selectedUser.profilePhotoUrl
                                        }
                                        alt={
                                          selectedUser.isDeactivated ||
                                          selectedUser.isDeleted
                                            ? "User"
                                            : `${selectedUser.firstName} ${selectedUser.lastName}`
                                        }
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
                                        } chat-bubble max-w-xs text-base overflow-x-hidden break-all md:max-w-lg`}
                                      >
                                        {(!message.content ||
                                          message.content === "") &&
                                          message.photo && (
                                            <img
                                              className="md:w-52 select-all pointer-events-auto md:h-52 w-32 h-32 object-cover cursor-pointer"
                                              src={message.photo}
                                              alt=""
                                              onClick={() =>
                                                openPhotoModal(message.photo)
                                              }
                                            />
                                          )}

                                        {(!message.photo ||
                                          message.photo === "") &&
                                          message.content && (
                                            <p>{message.content}</p>
                                          )}
                                      </h1>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center">
                          You recently deleted your conversation with{" "}
                          {selectedUser.firstName}.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="skeleton h-10 w-full"></div>
                      {!selectedUser.isDeactivated &&
                        !selectedUser.isDeleted && (
                          <p className="text-gray-500 text-center">
                            There are no messages here. Why not start a
                            conversation?
                          </p>
                        )}
                    </div>
                  )}
                </div>

                {selectedUser &&
                (selectedUser.isDeactivated || selectedUser.isDeleted) ? (
                  <h1 className="text-center text-xs md:text-base text-gray-500">
                    You can't send a message in this conversation. This account
                    has been deactivated or deleted.
                  </h1>
                ) : (
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex gap-2 pt-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={handleMessageChange}
                      className="w-full border rounded p-2 mr-2"
                    />
                    {photoPreview && (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-10 h-10 object-cover rounded mr-2"
                        />
                      </div>
                    )}

                    <label
                      disabled={isUploading}
                      htmlFor="photoInput"
                      className="btn btn-xs md:btn-sm flex items-center btn-primary text-white"
                    >
                      {isUploading ? (
                        <AiOutlineLoading3Quarters className="animate-spin" />
                      ) : (
                        <AiOutlinePicture className="" />
                      )}

                      <span className="md:block hidden">
                        {isUploading ? "Sending..." : "Send Photo"}
                      </span>
                    </label>
                    <input
                      id="photoInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="submit"
                      className="btn btn-xs md:btn-sm btn-primary text-white"
                      disabled={isUploading}
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="w-full border h-[500px] items-center p-4 rounded-lg mb-4 lg:w-3/4 grid justify-center">
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
