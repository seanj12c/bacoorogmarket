import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../../authContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore } from "../../firebase";
import cam from "../../assets/cam.png";
import uploadload from "../../assets/loading.gif";
import { MdOutlineAttachEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import Swal from "sweetalert2";
import { CiEdit, CiLocationArrow1, CiWarning } from "react-icons/ci";
import { HiDotsHorizontal } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

const MyAccount = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [displayProducts, setDisplayProducts] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contact: "",
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        console.log("User ID:", userId);

        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched data:", data);
            setUserData(data);

            onSnapshot(userDocRef, (doc) => {
              const newData = doc.data();
              if (newData && newData.profilePhotoUrl) {
                setUserData(newData);
              }
            });
          } else {
            console.log("No such document for this user!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user is authenticated.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [auth]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const db = getFirestore();

        try {
          const productsCollection = collection(db, "products");
          const recipesCollection = collection(db, "recipes");

          const userProductsQuery = query(
            productsCollection,
            where("userUid", "==", userId)
          );
          const userProductsSnapshot = await getDocs(userProductsQuery);
          const userProductsData = userProductsSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "product",
            ...doc.data(),
          }));

          const userRecipesQuery = query(
            recipesCollection,
            where("userUid", "==", userId)
          );
          const userRecipesSnapshot = await getDocs(userRecipesQuery);
          const userRecipesData = userRecipesSnapshot.docs.map((doc) => ({
            id: doc.id,
            type: "recipe",
            ...doc.data(),
          }));

          const allUserPosts = [...userProductsData, ...userRecipesData];
          setUserPosts(allUserPosts);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
    };

    fetchPosts();
  }, [auth]);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const db = getFirestore();
        const userDocRef = doc(db, "registered", userId);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              address: data.address || "",
              contact: data.contact || "",
            });
          } else {
            console.log("No such document for this user!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user is authenticated.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    closeForm();
    const userId = auth.currentUser.uid;
    const db = getFirestore();
    const userDocRef = doc(db, "registered", userId);

    try {
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data();

      // Check if last edit was made more than 14 days ago
      const lastEditTimestamp = userData.lastEditTimestamp || 0;
      const currentTime = Date.now();
      const timeDiffInDays = Math.ceil(
        (currentTime - lastEditTimestamp) / (1000 * 60 * 60 * 24)
      );

      if (timeDiffInDays < 14) {
        const lastEditDate = new Date(lastEditTimestamp);
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZone: "Asia/Manila",
        };
        const formattedLastEditDate = lastEditDate.toLocaleDateString(
          "en-PH",
          options
        );
        Swal.fire({
          title: "Cannot update profile",
          html: `Please try again after 14 days. Your profile was last updated on ${formattedLastEditDate}.`,
          icon: "warning",
        });
        return;
      }

      // Show confirmation dialog using SweetAlert
      const { value: confirmed } = await Swal.fire({
        title: "Are you sure on your details?",
        html: `
        <div class="text-start">
          <p>First Name: <strong>${formData.firstName}</strong></p>
          <p>Last Name: <strong>${formData.lastName}</strong></p>
          <p>Address: <strong>${formData.address}</strong></p>
          <p>Contact: <strong>${formData.contact}</strong></p>
        </div>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
      });

      if (confirmed) {
        await updateDoc(userDocRef, {
          ...formData,
          lastEditTimestamp: currentTime, // Update the last edit timestamp
        });
        Swal.fire({
          title: "Profile Updated!",
          text: "Your profile has been successfully updated.",
          icon: "success",
          timer: 3000, // Show for 3 seconds
          timerProgressBar: true,

          showConfirmButton: false,
        });

        console.log("User data updated successfully!");
        document.getElementById("my_modal_3").close();
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const closeForm = () => {
    document.getElementById("my_modal_3").close();
  };

  const toggleDisplay = (isProducts) => {
    setDisplayProducts(isProducts);
  };

  const showOptionsForPost = (post) => {
    setSelectedPost(post);
  };

  const deletePost = async (postId) => {
    try {
      if (postId && postId.type) {
        const db = getFirestore();
        const postDocRef = doc(
          db,
          postId.type === "product" ? "products" : "recipes",
          postId.id
        );

        await deleteDoc(postDocRef);
        const updatedPosts = userPosts.filter((post) => post.id !== postId.id);
        setUserPosts(updatedPosts);
        setShowDeleteConfirmation(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const confirmDelete = (post) => {
    deletePost(post);
    Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "The post has been deleted.",
      timer: 2000, // Set the notification to automatically close after 2 seconds
      showConfirmButton: false, // Hide the "OK" button
    });
  };

  const handleDeletePost = (post) => {
    setShowDeleteConfirmation(true);
    setSelectedPost(post);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedPost(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  const handleAppealPost = async (post, typeOfPost) => {
    const userId = auth.currentUser.uid;
    const existingAppeal = await checkExistingAppeal(post.id, userId);

    if (existingAppeal) {
      // User already has an appeal, provide option to edit
      Swal.fire({
        title: "Wait for admin's approval",
        text: "You have already submitted an appeal. Do you want to edit your explanation?",
        input: "text",
        inputValue: existingAppeal.explanation, // Prefill the existing explanation
        inputPlaceholder: "Enter your updated explanation...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        confirmButtonColor: "#008080",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Explanation is required!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Update the existing appeal in the Firebase Firestore database
          updateAppealInDatabase(existingAppeal.id, result.value);
        }
      });
    } else {
      // User doesn't have an existing appeal, allow to submit a new one
      Swal.fire({
        title: "Appeal Post",
        text: "Please provide an explanation for appealing this post:",
        input: "text",
        inputPlaceholder: "Enter your explanation...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        confirmButtonColor: "#008080",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Explanation is required!";
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Save the new appeal to the Firebase Firestore database
          saveNewAppealToDatabase(post, typeOfPost, result.value);
        }
      });
    }
  };

  // Function to check if the user has already submitted an appeal for the given post
  const checkExistingAppeal = async (postId, userId) => {
    const db = getFirestore();
    const querySnapshot = await getDocs(
      query(
        collection(db, "postAppeal"),
        where("postId", "==", postId),
        where("userId", "==", userId)
      )
    );
    if (!querySnapshot.empty) {
      // User has already submitted an appeal, return the first appeal found
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null; // User hasn't submitted an appeal for this post
  };

  // Function to save a new appeal to the Firebase Firestore database
  const saveNewAppealToDatabase = (post, typeOfPost, explanation) => {
    const userId = auth.currentUser.uid;
    const postId = post.id;

    const db = getFirestore();

    addDoc(collection(db, "postAppeal"), {
      userId: userId,
      postId: postId,
      typeOfPost: typeOfPost, // Save the type of post
      explanation: explanation,
      timestamp: new Date(),
    })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your appeal has been submitted successfully! Wait for admin's approval",
          showConfirmButton: false,
          timer: 2000,
        });
      })
      .catch((error) => {
        console.error("Error adding appeal: ", error);
      });
  };

  // Function to update an existing appeal in the Firebase Firestore database
  const updateAppealInDatabase = (appealId, explanation) => {
    const db = getFirestore();

    updateDoc(doc(db, "postAppeal", appealId), {
      explanation: explanation,
      timestamp: new Date(),
    })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your appeal has been updated successfully! Wait for admin's approval",
          showConfirmButton: false,
          timer: 2000,
        });
      })
      .catch((error) => {
        console.error("Error updating appeal: ", error);
      });
  };

  const uploadProfilePicture = async (file) => {
    if (file) {
      const userId = auth.currentUser.uid;

      const db = getFirestore();
      const userDocRef = doc(db, "registered", userId);

      try {
        setIsUploading(true);

        const uniqueFilename = `${userId}_${Date.now()}.jpg`;

        const imagePath = `users/${userId}/${uniqueFilename}`;

        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, file);

        const photoURL = await getDownloadURL(imageRef);

        const updatedData = {
          ...userData,
          profilePhotoUrl: photoURL,
        };

        await updateDoc(userDocRef, updatedData);

        console.log("Profile photo updated");

        setNewProfilePicture(null);
        setIsUploading(false);
      } catch (error) {
        console.error("Error updating profile photo:", error);
        setIsUploading(false);
      }
    }
  };

  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/info/${product.id}`);
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/info/${recipe.id}`);
  };

  const deleteAccount = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        const docRef = doc(firestore, "accountDeleteReasons", userId);
        const docSnap = await getDoc(docRef);
        const previousReason = docSnap.exists() ? docSnap.data().reason : null;
        const previousExplanation = docSnap.exists()
          ? docSnap.data().explanation
          : null;

        const title = previousReason
          ? "You previously submitted an account deletion request. Do you want to edit your reason or explanation?"
          : "Why do you want to delete your account?";

        const { value: reason, value: explanation } = await Swal.fire({
          title: title,
          input: "select",
          inputOptions: {
            "No longer need the account": "No longer need the account",
            "Found better alternatives": "Found better alternatives",
            "Privacy concerns": "Privacy concerns",
            "Account security issues": "Account security issues",
            "Just want to delete": "Just want to delete",
            Other: "Other",
          },
          inputValidator: (value) => {
            if (!value) {
              return "You need to select a reason";
            }
          },
          inputPlaceholder: "Select a reason",
          inputAttributes: {
            autocapitalize: "off",
            style: "border: 1px solid #ccc; border-radius: 5px; padding: 5px;", // CSS styles for the select input
          },
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonColor: "#008080",
          confirmButtonText: "Submit",
          showLoaderOnConfirm: true,
          html:
            '<textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Explain why">' +
            (previousExplanation ? previousExplanation : "") +
            "</textarea>",
          preConfirm: async () => {
            const explanationValue =
              Swal.getPopup().querySelector("#swal-input2").value;
            if (!explanationValue) {
              Swal.showValidationMessage("You need to provide an explanation");
            } else {
              const reasonValue =
                Swal.getPopup().querySelector(".swal2-select").value;
              const deletionData = {
                reason: reasonValue,
                explanation: explanationValue,
                userId: userId,
              };

              // Show a confirmation dialog before submitting the deletion request
              const confirmResult = await Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone.",
                icon: "warning",
                html: '<input id="confirmInput" class="p-3 input input-bordered text-xs md:text-base w-full" placeholder="Type \'Confirm\' to proceed">',
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, delete my account",
                preConfirm: () => {
                  const confirmInputValue =
                    document.getElementById("confirmInput").value;
                  if (confirmInputValue.trim().toLowerCase() !== "confirm") {
                    Swal.showValidationMessage(
                      "Please type 'Confirm' to proceed"
                    );
                  }
                },
              });

              if (confirmResult.isConfirmed) {
                // Proceed with deletion
                try {
                  await setDoc(docRef, deletionData);
                  Swal.fire({
                    title: "Account Deletion Request Sent Successfully",
                    text: "Please wait for the confirmation.",
                    icon: "success",
                    confirmButtonColor: "#008080",
                    confirmButtonText: "Done",
                  });
                } catch (error) {
                  console.error("Error deleting account:", error);
                  Swal.fire(
                    "Error!",
                    "An error occurred while processing the account deletion request.",
                    "error"
                  );
                }
              }
            }
          },
        });

        if (reason && explanation) {
          // Any additional logic after account deletion request
        }
      } else {
        console.log("User not authenticated");
        // Handle if user is not authenticated
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Swal.fire(
        "Error!",
        "An error occurred while processing the account deletion request.",
        "error"
      );
    }
  };
  // Function for account deactivation confirmation
  const deactivateAccount = async () => {
    const inputOptions = {
      "Discouraged negative feedback": "Discouraged negative feedback",
      "Lack of trust in buyer-seller interactions.":
        "Lack of trust in buyer-seller interactions.",
      "I just want to deactivate": "I just want to deactivate",
      "Too much time involved in selling": "Too much time involved in selling",
      "Identity protection": "Identity protection",
      "Financial reasons": "Financial reasons",
      Others: "Others",
    };

    try {
      const {
        value: { reason, explanation },
      } = await Swal.fire({
        title: "Deactivate Account",
        html: `
        <textarea id="explanationInput" class="p-3 input input-bordered text-xs md:text-base w-full" placeholder="Please provide an explanation..." style="margin-top: 10px;"></textarea>
        <select id="reasonSelect" class="swal2-select mx-auto" style="border: 1px solid #ccc; border-radius: 5px; padding: 5px;">
          <option value="" disabled selected>Select a reason...</option>
          ${Object.entries(inputOptions)
            .map(([key, value]) => `<option value="${key}">${value}</option>`)
            .join("")}
        </select>
      `,
        showCancelButton: true,
        confirmButtonText: "Deactivate",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
        focusCancel: true,
        preConfirm: () => {
          const reason = document.getElementById("reasonSelect").value;
          const explanation = document.getElementById("explanationInput").value;

          if (!reason || !explanation) {
            Swal.showValidationMessage(
              "Please select a reason and provide an explanation"
            );
            return false;
          }

          return { reason, explanation };
        },
      });

      if (!reason || !explanation) return;

      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        html: `
        <input id="confirmInput" class="swal2-input text-xs md:text-base w-full mx-auto" style="border: 1px solid #ccc; border-radius: 5px; padding: 2px;"
               placeholder="Type 'Deactivate to proceed'">
      `,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, deactivate my account",
        preConfirm: () => {
          const confirmInputValue =
            document.getElementById("confirmInput").value;
          if (confirmInputValue.trim().toLowerCase() !== "deactivate") {
            Swal.showValidationMessage("Please type 'Deactivate' to proceed");
            return false;
          }
        },
      });

      if (!confirmResult.isConfirmed) {
        Swal.fire({
          title: "Deactivation Canceled",
          text: "Your account deactivation has been canceled.",
          icon: "info",
        });
        return;
      }

      // Perform account deactivation logic here
      // Add code here to update the user's account status to deactivated

      const userId = auth.currentUser.uid;
      const docRef = doc(firestore, "accountDeactivateReasons", userId);

      await setDoc(docRef, { reason, explanation, userId });

      // Hide recipes
      const recipesQuery = query(
        collection(firestore, "recipes"),
        where("userUid", "==", userId)
      );
      const recipesSnapshot = await getDocs(recipesQuery);
      recipesSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { accountDeactivated: true });
      });

      // Hide products
      const productsQuery = query(
        collection(firestore, "products"),
        where("userUid", "==", userId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      productsSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { accountDeactivated: true });
      });

      // Hide chats
      const chatsQuery = query(
        collection(firestore, "chats"),
        where("messages", "array-contains", { senderId: userId })
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      chatsSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { accountDeactivated: true });
      });

      Swal.fire({
        title: "Account Deactivated",
        text: `Your account has been deactivated. Reason: ${reason}. Explanation: ${explanation}`,
        icon: "success",
      });

      navigate("/");

      // Update user status to deactivated
      const userRef = doc(firestore, "registered", userId);
      await updateDoc(userRef, { isDeactivated: true });
    } catch (error) {
      console.error("Error deactivating account:", error);
      Swal.fire(
        "Error!",
        "An error occurred while deactivating your account.",
        "error"
      );
    }
  };

  return (
    <div className="md:max-w-full max-w-xl  mx-auto md:p-0 p-4">
      {loading ? (
        <div className="h-screen pt-0 w-full grid items-center">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto flex justify-center items-center"
            src={uploadload}
            alt=""
          />
        </div>
      ) : userData ? (
        <div className="h-full md:pb-0 pb-20 pt-24 w-full ">
          <div className="md:flex ">
            <div className="md:fixed md:w-1/3 md:px-5">
              <div className="bg-bgray mt-2 w-full py-4 px-2 rounded-lg">
                <h2 className="text-2xl md:text-base lg:text-xl text-center  font-bold">
                  My Account
                </h2>
                <div className="flex items-center justify-end  pb-3 px-5">
                  <button
                    onClick={() =>
                      document.getElementById("my_modal_3").showModal()
                    }
                    className="btn btn-xs btn-primary"
                  >
                    <CiEdit />
                    Edit Profile
                  </button>

                  <dialog id="my_modal_3" className="modal">
                    <div className="modal-box p-6 bg-gray-200 rounded-lg shadow-lg">
                      <button
                        onClick={closeForm}
                        className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
                      >
                        ✕
                      </button>
                      <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col">
                          <label
                            htmlFor="firstName"
                            className="text-sm font-medium"
                          >
                            First Name:
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="lastName"
                            className="text-sm font-medium"
                          >
                            Last Name:
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="address"
                            className="text-sm font-medium"
                          >
                            Address:
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input"
                            required
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="contact"
                            className="text-sm font-medium"
                          >
                            Contact:
                          </label>
                          <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="input"
                            pattern="[0-9]{11}"
                            title="Enter 11 digits contact number starts at 09"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn w-full btn-primary"
                        >
                          Update
                        </button>
                      </form>
                    </div>
                  </dialog>
                </div>
                {auth.currentUser ? (
                  <div className="w-full">
                    <div className="mb-2 w-full">
                      {userData.profilePhotoUrl && !isUploading ? (
                        <img
                          src={userData.profilePhotoUrl}
                          alt="Profile"
                          className="object-cover w-48 h-48 lg:w-36 lg:h-36 md:w-28 md:h-28 mx-auto"
                          style={{
                            border: "2px solid #008080",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                          alt="Default Profile"
                          className="object-cover w-48 h-48 lg:w-36 lg:h-36 md:w-28 md:h-28  mx-auto"
                          style={{
                            border: "2px solid #008080",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                      <label
                        htmlFor="profile-picture"
                        className="cursor-pointer"
                      >
                        {isUploading ? (
                          <div className="w-full h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                            <img
                              className="w-8 object-contain"
                              src={uploadload}
                              alt="loading-"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full border btn-xs font-normal btn rounded-lg flex gap-1 justify-center mt-2 items-center">
                            <img
                              className="w-4 object-contain"
                              src={cam}
                              alt="upload-"
                            />
                            Change Profile Picture
                          </div>
                        )}
                        <input
                          type="file"
                          id="profile-picture"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {newProfilePicture && isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                <p className="text-center text-2xl lg:text-2xl md:text-base mx-auto">
                  <strong>
                    {userData.firstName} {userData.lastName}
                  </strong>
                </p>
                <a
                  href={`mailto:${userData.email}`}
                  className="text-xs flex items-center hover:text-primary hover:translate-x-1 transition-all ease-in-out duration-300 py-1  gap-2"
                >
                  <MdOutlineAttachEmail size={15} /> {userData.email}
                </a>
                <p className="text-xs flex items-center hover:text-primary  hover:translate-x-1 transition-all ease-in-out duration-300 py-1 gap-2">
                  <CiLocationArrow1 size={15} /> {userData.address}
                </p>
                <a
                  href={`tel:${userData.contact}`}
                  className="text-xs flex items-center hover:text-primary py-1 hover:translate-x-1 transition-all ease-in-out duration-300 gap-2"
                >
                  <FaPhone size={15} /> {userData.contact}
                </a>
                <div className="md:flex flex-col justify-center md:gap-0 gap-2">
                  <div className="flex justify-center pt-2">
                    <button
                      className="btn-error btn btn-sm    text-white "
                      onClick={deleteAccount}
                    >
                      <CiWarning className="text-xl font-bold" />
                      Acount Deletion
                    </button>
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      className="btn-error btn btn-sm   text-white "
                      onClick={deactivateAccount}
                    >
                      <CiWarning className="text-xl font-bold" />
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-2">
                <h1 className="text-lg text-center w-full font-bold pb-2">
                  Want to post something?
                </h1>

                <div className="flex justify-center gap-2">
                  <Link
                    to="/post_product"
                    className="btn-sm md:btn-xs lg:btn-sm btn btn-primary"
                  >
                    Post a Product
                  </Link>
                  <Link
                    to="/post_recipe"
                    className="btn-sm md:btn-xs lg:btn-sm btn btn-primary"
                  >
                    Post a Recipe
                  </Link>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 md:px-5 md:ml-auto">
              <div className="md:fixed md:flex justify-center  bg-bgray md:bg-transparent md:w-2/3 md:px-5 mx-auto  py-2 rounded-lg my-2">
                <div className="md:glass md:w-full md:max-w-3xl md:h-20 rounded-lg p-2">
                  <h1 className="text-center font-bold text-black mb-2">
                    You posts here
                  </h1>
                  <div className="flex text-xs items-center justify-center">
                    <button
                      onClick={() => toggleDisplay(true)}
                      className={`mx-2 px-4 py-2 ${
                        displayProducts
                          ? "bg-primary text-white"
                          : "bg-gray-400 text-black"
                      } rounded-md`}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => toggleDisplay(false)}
                      className={`mx-2 px-4 py-2 ${
                        displayProducts
                          ? "bg-gray-400 text-black"
                          : "bg-primary text-white"
                      } rounded-md`}
                    >
                      Recipes
                    </button>
                  </div>
                </div>
              </div>

              {displayProducts ? (
                // Render products
                <div className="md:pt-24">
                  {userPosts.filter((post) => post.type === "product").length >
                  0 ? (
                    userPosts
                      .filter((post) => post.type === "product")
                      .sort((a, b) => b.productId - a.productId)
                      .map((product, index) => (
                        // Render product item
                        <div
                          key={index}
                          className={`${
                            product.isHidden ? "relative" : ""
                          } bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer`}
                        >
                          {product.isHidden && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex items-center justify-center">
                              <p className="text-white text-xs md:text-base text-center">
                                <div className="flex flex-col">
                                  <p className="text-white text-xs md:text-base text-center">
                                    This post is hidden due to:{" "}
                                    {product.hideReason}
                                  </p>
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() =>
                                        handleAppealPost(product, "product")
                                      }
                                      className="btn btn-primary btn-xs md:btn-sm "
                                    >
                                      Appeal
                                    </button>
                                    <button
                                      onClick={() => handleDeletePost(product)}
                                      className="btn btn-error text-white btn-xs md:btn-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 py-2 items-center w-full justify-between">
                            <div className="flex gap-2 items-center w-full justify-between px-2">
                              <div className="flex gap-4 items-center">
                                {userData.profilePhotoUrl && !isUploading ? (
                                  <img
                                    src={userData.profilePhotoUrl}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                ) : (
                                  <img
                                    src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                                    alt="Default Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                )}
                                <div>
                                  <p className="text-primary text-sm font-semibold">
                                    {userData.firstName} {userData.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {product.timestamp}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`${
                                  product.isHidden ? "hidden" : "relative"
                                }`}
                              >
                                <HiDotsHorizontal
                                  className="text-primary"
                                  size={20}
                                  onClick={() => showOptionsForPost(product)}
                                />
                                {selectedPost && selectedPost === product && (
                                  <div
                                    className="absolute text-xs bg-white p-2 flex flex-col gap-1 justify-center rounded-lg"
                                    style={{ top: "-40px", right: "-20px" }}
                                  >
                                    <Link
                                      to={`/edit_product/${product.id}`}
                                      className="cursor-pointer bg-green-400 text-white py-1 px-2 rounded-md"
                                    >
                                      Edit
                                    </Link>
                                    <div className="flex flex-col gap-1 justify-center">
                                      {!isEditing ? (
                                        <button
                                          onClick={() =>
                                            handleDeletePost(product)
                                          }
                                          className="bg-red-400 text-white py-1 px-2 rounded-md"
                                        >
                                          Delete
                                        </button>
                                      ) : null}
                                      {!isEditing ? (
                                        <button
                                          onClick={() =>
                                            showOptionsForPost(false)
                                          }
                                          className="bg-black text-white py-1 px-2 rounded-md"
                                        >
                                          Close
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h1 className="text-lg font-semibold mb-2">
                              {product.caption}
                            </h1>
                          </div>
                          <div
                            onClick={() => handleProductClick(product)}
                            className={
                              product.photos && product.photos.length > 1
                                ? "grid gap-2 grid-cols-2"
                                : ""
                            }
                          >
                            {product.photos &&
                              product.photos
                                .slice(0, 4)
                                .map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    className="w-full h-40 md:h-72 object-cover rounded-lg mb-2"
                                    src={photo}
                                    alt=""
                                  />
                                ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                      </div>
                      <p className="text-center text-xs md:text-lg text-primary italic">
                        Oh no! You haven't post a product/s yet. Post now and it
                        will show here!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Render recipes
                <div className="md:pt-24">
                  {userPosts.filter((post) => post.type === "recipe").length >
                  0 ? (
                    userPosts
                      .filter((post) => post.type === "recipe")
                      .sort((a, b) => b.recipeId - a.recipeId)
                      .map((recipe, index) => (
                        // Render recipe item
                        <div
                          key={index}
                          className={`${
                            recipe.isHidden ? "relative" : ""
                          } bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer`}
                        >
                          {recipe.isHidden && (
                            <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex items-center justify-center">
                              <div className="flex flex-col">
                                <p className="text-white text-xs md:text-base text-center">
                                  This post is hidden due to:{" "}
                                  {recipe.hideReason}
                                </p>
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() =>
                                      handleAppealPost(recipe, "recipe")
                                    }
                                    className="btn btn-primary btn-xs md:btn-sm "
                                  >
                                    Appeal
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(recipe)}
                                    className="btn btn-error text-white btn-xs md:btn-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 py-2 items-center w-full justify-between">
                            <div className="flex gap-2 items-center w-full justify-between px-2">
                              <div className="flex gap-4 items-center">
                                {userData.profilePhotoUrl && !isUploading ? (
                                  <img
                                    src={userData.profilePhotoUrl}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                ) : (
                                  <img
                                    src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                                    alt="Default Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                )}
                                <div>
                                  <p className="text-primary text-sm font-semibold">
                                    {userData.firstName} {userData.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {recipe.timestamp}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`${
                                  recipe.isHidden ? "hidden" : "relative"
                                }`}
                              >
                                <HiDotsHorizontal
                                  className="text-primary"
                                  size={20}
                                  onClick={() => showOptionsForPost(recipe)}
                                />
                                {selectedPost && selectedPost === recipe && (
                                  <div
                                    className="absolute text-xs bg-white p-2 flex flex-col gap-1 justify-center rounded-lg"
                                    style={{ top: "-40px", right: "-20px" }}
                                  >
                                    <Link
                                      to={`/edit_recipe/${recipe.id}`}
                                      className="cursor-pointer bg-green-400 text-white py-1 px-2 rounded-md"
                                    >
                                      Edit
                                    </Link>
                                    <div className="flex flex-col gap-1 justify-center">
                                      {!isEditing ? (
                                        <button
                                          onClick={() =>
                                            handleDeletePost(recipe)
                                          }
                                          className="bg-red-400 text-white py-1 px-2 rounded-md"
                                        >
                                          Delete
                                        </button>
                                      ) : null}
                                      {!isEditing ? (
                                        <button
                                          onClick={() =>
                                            showOptionsForPost(false)
                                          }
                                          className="bg-black text-white py-1 px-2 rounded-md"
                                        >
                                          Close
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h1 className="text-lg font-semibold mb-2">
                              {recipe.caption}
                            </h1>
                          </div>
                          <div
                            onClick={() => handleRecipeClick(recipe)}
                            className={
                              recipe.photos && recipe.photos.length > 1
                                ? "grid gap-2 grid-cols-2"
                                : ""
                            }
                          >
                            {recipe.photos &&
                              recipe.photos
                                .slice(0, 4)
                                .map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    className="w-full h-40 md:h-72 object-cover rounded-lg mb-2"
                                    src={photo}
                                    alt=""
                                  />
                                ))}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                        <div className="skeleton h-4 w-full"></div>
                      </div>
                      <p className="text-center text-xs md:text-lg text-primary italic">
                        You have no recipe/s posted yet. Post now and your
                        secret recipe will be revealed!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedPost && showDeleteConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white w-full max-w-md p-6 rounded-lg text-primary">
                <p className="text-lg mb-4">
                  Are you sure you want to delete this post?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => confirmDelete(selectedPost)}
                    className="btn btn-primary text-white btn-xs"
                  >
                    Yes
                  </button>

                  <button
                    onClick={handleCancelDelete}
                    className="btn btn-error text-white btn-xs"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default MyAccount;
