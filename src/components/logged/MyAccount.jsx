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
            const userPostsData = userPostsSnapshot.docs.map((doc) =>
              doc.data()
            );
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfilePicture(file);
    }
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
    <div className="max-w-xl pt-24 mx-auto p-4">
      {loading ? (
        <p>Loading user data...</p>
      ) : userData ? (
        <div className="h-full w-full ">
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
          <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-4">
            <div className="flex  items-center pb-2 justify-between px-2">
              <div className="flex gap-2 items-center">
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
                <h1 className="font-bold text-xs">
                  {userData.firstName} {userData.lastName}
                </h1>
              </div>
              <HiDotsHorizontal className="text-primary" size={20} />
            </div>
            <div className="py-1">
              {userPosts.map((post, index) => (
                <div key={index} className="mb-4">
                  <h1 className="text-2xl font-semibold mb-2">{post.name}</h1>
                  {post.photos && post.photos.length > 0 && (
                    <div className="mb-4">
                      {post.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`PhotoA ${photoIndex}`}
                          className="w-full h-36 object-cover rounded-lg mb-2"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default MyAccount;
