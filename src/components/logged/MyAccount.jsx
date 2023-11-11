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
import down from "../../assets/down.gif";
import { HiDotsHorizontal } from "react-icons/hi";
import { Link } from "react-router-dom";

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

            // Subscribe to changes in the profilePhotoUrl field
            onSnapshot(userDocRef, (doc) => {
              const newData = doc.data();
              if (newData && newData.profilePhotoUrl) {
                setUserData(newData);
              }
            });

            // Fetch and display posts of the current user
            const postsCollection = collection(db, "recipes");
            const userPostsQuery = query(
              postsCollection,
              where("userUid", "==", userId)
            );
            const userPostsSnapshot = await getDocs(userPostsQuery);
            const userPostsData = userPostsSnapshot.docs.map((doc) => {
              return {
                id: doc.id,
                ...doc.data(),
              };
            });
            setUserPosts(userPostsData);
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

  const showOptionsForPost = (post) => {
    setSelectedPost(post);
    setEditedCaption(post.name); // Initialize the edited caption with the current post name
  };

  const hideOptions = () => {
    setSelectedPost(null);
  };

  const deletePost = async (postId) => {
    try {
      if (postId) {
        const db = getFirestore();
        const postDocRef = doc(db, "recipes", postId);

        await deleteDoc(postDocRef);
        const updatedPosts = userPosts.filter((post) => post.id !== postId);
        setUserPosts(updatedPosts);
        setShowDeleteConfirmation(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const confirmDelete = (postId) => {
    deletePost(postId);
  };

  const handleEditCaption = async () => {
    if (selectedPost) {
      const updatedPost = { ...selectedPost, name: editedCaption };

      const updatedPosts = userPosts.map((post) =>
        post === selectedPost ? updatedPost : post
      );
      setUserPosts(updatedPosts);

      try {
        if (selectedPost.id) {
          const db = getFirestore();
          const postDocRef = doc(db, "recipes", selectedPost.id);

          await updateDoc(postDocRef, { name: editedCaption });

          console.log("Post name updated in Firestore");

          setIsEditing(false);
          hideOptions();
        } else {
          console.error("Selected post doesn't have an ID");
          // Handle the case where the selected post doesn't have an ID
        }
      } catch (error) {
        console.error("Error updating post in Firestore:", error);
        // If the Firestore update fails, handle it accordingly
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
    setEditedCaption(selectedPost.name); // Reset the edited caption if editing is canceled
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

  return (
    <div className="max-w-xl  mx-auto p-4">
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
                      className="object-cover mx-auto"
                      style={{
                        width: "200px",
                        height: "200px",
                        border: "2px solid #008080",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                      alt="Default Profile"
                      className="object-cover mx-auto"
                      style={{
                        width: "200px",
                        height: "200px",
                        border: "2px solid #008080",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <label htmlFor="profile-picture" className="cursor-pointer">
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
            </p>
          </div>
          <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-4">
            <h1 className="text-2xl text-center w-full font-bold ">Posts</h1>
            <div className="flex h-full w-full gap-2 py-2 justify-around items-center">
              {userData.profilePhotoUrl && !isUploading ? (
                <img
                  src={userData.profilePhotoUrl}
                  alt="Profile"
                  className="h-10 w-10 object-cover rounded-full"
                />
              ) : (
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/bacoorogmarket.appspot.com/o/default_person.jpg?alt=media&token=c6e5a6ed-68a9-44c0-abf4-ddfaed152a1b&_gl=1*1pfbpxr*_ga*NjkxNTc3MTE5LjE2OTI1MT4w5Njcy5NTIuMC4w"
                  alt="Default Profile"
                  className="h-10 w-10 object-cover rounded-full"
                />
              )}
              <h1 className="text-xs">You can post something here...</h1>
              <img className="w-10 h-10 object-contain" src={down} alt="" />
            </div>
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

          <div className="bg-bgray mt-2 w-full rounded-lg p-2">
            {userPosts.map((post, index) => (
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
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <HiDotsHorizontal
                        className="text-primary"
                        size={20}
                        onClick={() => showOptionsForPost(post)}
                      />
                      {selectedPost && selectedPost === post && (
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
                                onClick={() => handleDeletePost(post)}
                                className="bg-red-400 text-white py-1 px-2 rounded-md"
                              >
                                Delete
                              </button>
                            ) : null}
                            {!isEditing ? (
                              <button
                                onClick={() => showOptionsForPost(false)}
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
                  <h1 className="text-lg font-semibold mb-2">{post.name}</h1>
                </div>
                <div>
                  {post.photos &&
                    post.photos.length > 0 &&
                    post.photos.map((photo, photoIndex) => (
                      <img
                        key={photoIndex}
                        className="w-full h-36 object-cover rounded-lg mb-2"
                        src={photo}
                        alt=""
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          {selectedPost && showDeleteConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white w-full max-w-md p-6 rounded-lg text-primary">
                <p className="text-lg mb-4">
                  Are you sure you want to delete this post?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => confirmDelete(selectedPost.id)}
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
    </div>
  );
};

export default MyAccount;
