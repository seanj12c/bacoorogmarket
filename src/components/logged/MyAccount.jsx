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
} from "firebase/firestore";
import { useAuth } from "../../authContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import cam from "../../assets/cam.png";
import uploadload from "../../assets/loading.gif";

import { HiDotsHorizontal } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import LogoutModal from "../authentication/LogoutModal";
import { getAuth, signOut } from "firebase/auth";

const MyAccount = () => {
  const auth = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [displayProducts, setDisplayProducts] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const toggleDisplay = (isProducts) => {
    setDisplayProducts(isProducts);
  };

  const showOptionsForPost = (post) => {
    setSelectedPost(post);

    setEditedCaption(post.caption || post.name);
  };

  const hideOptions = () => {
    setSelectedPost(null);
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
  };

  const handleEditCaption = async () => {
    if (selectedPost) {
      const updatedPost = { ...selectedPost, caption: editedCaption };

      const updatedPosts = userPosts.map((post) =>
        post === selectedPost ? updatedPost : post
      );
      setUserPosts(updatedPosts);

      try {
        if (selectedPost.id) {
          const db = getFirestore();
          const postDocRef = doc(
            db,
            selectedPost.type === "product" ? "products" : "recipes",
            selectedPost.id
          );

          await updateDoc(postDocRef, { caption: editedCaption });

          console.log("Post caption updated in Firestore");

          setIsEditing(false);
          hideOptions();
        } else {
          console.error("Selected post doesn't have an ID");
        }
      } catch (error) {
        console.error("Error updating post caption in Firestore:", error);
      }
    }
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCaption(selectedPost.caption || selectedPost.name); // Reset the edited caption if editing is canceled
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

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

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
        <div className="h-full pt-24 w-full ">
          <div className="md:flex ">
            <div className="md:fixed md:w-1/3 md:px-5">
              <div className="bg-bgray mt-2 w-full py-4 px-2 rounded-lg">
                <h2 className="text-2xl text-center w-full font-bold mb-4">
                  My Account
                </h2>
                {auth.currentUser ? (
                  <div className="w-full">
                    <div className="mb-2 w-full">
                      {userData.profilePhotoUrl && !isUploading ? (
                        <img
                          src={userData.profilePhotoUrl}
                          alt="Profile"
                          className="object-cover w-48 h-48 md:w-36 md:h-36 mx-auto"
                          style={{
                            border: "2px solid #008080",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                          alt="Default Profile"
                          className="object-cover w-48 h-48 md:w-36 md:h-36  mx-auto"
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
                          <div className="w-full h-full border rounded-lg flex gap-1 justify-center mt-2 items-center">
                            <img
                              className="w-6 object-contain"
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
                <p className="text-center text-2xl mx-auto">
                  <strong>
                    {userData.firstName} {userData.lastName}
                  </strong>
                </p>
                <p className="text-xs">
                  <strong>Email:</strong> {userData.email}
                </p>
                <p className="text-xs">
                  <strong>Address:</strong> {userData.address}
                </p>{" "}
                <p className="text-xs">
                  <strong>Contact:</strong> {userData.contact}
                </p>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={toggleLogoutModal}
                    className="bg-red-500  text-white py-2 px-4 rounded-lg hover-bg-red-600 focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-4">
                <h1 className="text-2xl text-center w-full font-bold py-2">
                  Want to post something?
                </h1>

                <div className="flex justify-center gap-2">
                  <Link
                    to="/post_product"
                    className="px-4 text-xs py-2 bg-primary rounded-md text-white"
                  >
                    Post a Product
                  </Link>
                  <Link
                    to="/post_recipe"
                    className="px-4 text-xs py-2 bg-primary rounded-md text-white"
                  >
                    Post a Recipe
                  </Link>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 md:px-5 md:ml-auto">
              <div className="md:fixed left-0 right-0 bg-bgray py-2 rounded-lg  my-4">
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

              {displayProducts ? (
                // Render products
                <div className="md:pt-24">
                  {userPosts
                    .filter((post) => post.type === "product")
                    .sort((a, b) => b.productId - a.productId)
                    .map((product, index) => (
                      // Render product item
                      <div
                        key={index}
                        className="bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer"
                      >
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
                            <div style={{ position: "relative" }}>
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
                                  {!isEditing ? (
                                    <p
                                      onClick={() => setIsEditing(true)}
                                      className=" cursor-pointer bg-green-400 text-white py-1 px-2 rounded-md"
                                    >
                                      Edit
                                    </p>
                                  ) : (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                      <div className="bg-white w-full max-w-md p-6 rounded-lg">
                                        <p className="text-lg mb-4 text-primary">
                                          Edit Caption
                                        </p>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={editedCaption}
                                            onChange={(e) =>
                                              setEditedCaption(e.target.value)
                                            }
                                            className="bg-gray-100 border rounded px-2 py-1 w-full"
                                            placeholder="Enter new caption"
                                          />
                                          <div className="flex justify-end mt-2">
                                            <button
                                              onClick={handleEditCaption}
                                              className="bg-green-400 rounded text-white px-4 py-1 mr-2"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="bg-red-400 rounded text-white px-4 py-1"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

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
                                  className="w-full h-40 object-cover rounded-lg mb-2"
                                  src={photo}
                                  alt=""
                                />
                              ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                // Render recipes
                <div className="md:pt-24">
                  {userPosts
                    .filter((post) => post.type === "recipe")
                    .sort((a, b) => b.recipeId - a.recipeId)
                    .map((recipe, index) => (
                      // Render recipe item
                      <div
                        key={index}
                        className="bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer"
                      >
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

                            <div style={{ position: "relative" }}>
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
                                  {!isEditing ? (
                                    <p
                                      onClick={() => setIsEditing(true)}
                                      className=" cursor-pointer bg-green-400 text-white py-1 px-2 rounded-md"
                                    >
                                      Edit
                                    </p>
                                  ) : (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                      <div className="bg-white w-full max-w-md p-6 rounded-lg">
                                        <p className="text-lg mb-4 text-primary">
                                          Edit Caption
                                        </p>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={editedCaption}
                                            onChange={(e) =>
                                              setEditedCaption(e.target.value)
                                            }
                                            className="bg-gray-100 border rounded px-2 py-1 w-full"
                                            placeholder="Enter new caption"
                                          />
                                          <div className="flex justify-end mt-2">
                                            <button
                                              onClick={handleEditCaption}
                                              className="bg-green-400 rounded text-white px-4 py-1 mr-2"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="bg-red-400 rounded text-white px-4 py-1"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-1 justify-center">
                                    {!isEditing ? (
                                      <button
                                        onClick={() => handleDeletePost(recipe)}
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
                                  className="w-full h-40 object-cover rounded-lg mb-2"
                                  src={photo}
                                  alt=""
                                />
                              ))}
                        </div>
                      </div>
                    ))}
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
                    className="bg-green-400 rounded text-white px-4 py-1"
                  >
                    Yes
                  </button>

                  <button
                    onClick={handleCancelDelete}
                    className="bg-red-400 rounded text-white px-4 py-1"
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
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default MyAccount;
