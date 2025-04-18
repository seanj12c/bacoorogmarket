import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import uploadload from "../../assets/loading.gif";
import { MdOutlineAttachEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { auth } from "../../firebase";
import { CiLocationArrow1 } from "react-icons/ci";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FaStar } from "react-icons/fa6";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  useEffect(() => {
    const registeredCollection = collection(firestore, "registered");
    const userQuery = query(
      registeredCollection,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(userQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setUser({
          id: doc.id,
          profilePhotoUrl: data.profilePhotoUrl,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          contact: data.contact,
          address: data.address,
          userId: data.userId,
          role: data.role,
          soldProduct: data.soldProduct,
        });
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    if (!user) return;

    const fetchUserPosts = async () => {
      try {
        const productsCollection = collection(firestore, "products");
        const recipesCollection = collection(firestore, "recipes");

        const userProductsQuery = query(
          productsCollection,
          where("userUid", "==", user.userId)
        );
        const userProductsSnapshot = await getDocs(userProductsQuery);
        const userProductsData = userProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "product",
          ...doc.data(),
        }));

        const userRecipesQuery = query(
          recipesCollection,
          where("userUid", "==", user.userId)
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
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, [user]);

  const toggleDisplay = (isProducts) => {
    setDisplayProducts(isProducts);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/info/${productId}`);
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/info/${recipeId}`);
  };

  const handleMessageSelect = async () => {
    try {
      const chatId = [auth.currentUser.uid, user.userId].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);

      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        await setDoc(chatDocRef, {
          users: [auth.currentUser.uid, user.userId],
          messages: [],
        });
      }

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const handleReportProfile = async () => {
    try {
      const currentUserId = auth.currentUser.uid;
      const reportQuery = query(
        collection(firestore, "profileReports"),
        where("userId", "==", user.userId),
        where("reporterId", "==", currentUserId)
      );
      const reportSnapshot = await getDocs(reportQuery);

      if (!reportSnapshot.empty) {
        Swal.fire({
          title: "Already Reported",
          text: "You have already reported this profile.",
          icon: "info",
        });
        return;
      }

      const { value: reason } = await Swal.fire({
        title: `Why do you want to report ${user.firstName}?`,
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
              `profileReports/${user.userId}/${randomFileName}`
            );
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            const reportData = {
              reason,
              explanation,
              userId: user.userId,
              reporterId: currentUserId,
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

  const handleViewProfilePhoto = () => {
    Swal.fire({
      imageUrl: user.profilePhotoUrl,
      imageAlt: "Profile",
      customClass: {
        image: "custom-profile-photo-class",
        closeButton: "btn btn-error btn-circle text-white",
      },
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    const fetchReviewData = () => {
      try {
        const reviewQuery = query(
          collection(firestore, "reviews"),
          where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(reviewQuery, (reviewSnapshot) => {
          let totalRating = 0;
          let totalReviews = 0;

          reviewSnapshot.forEach((doc) => {
            const reviewData = doc.data();
            totalRating += parseInt(reviewData.rating, 10);
            totalReviews++;
          });

          const averageRating =
            totalReviews > 0 ? totalRating / totalReviews : 0;
          setReviewCount(averageRating);
          setTotalReviews(totalReviews);
        });

        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching review data:", error);
      }
    };

    fetchReviewData();
  }, [userId]);

  const handleSubmitReview = async () => {
    try {
      const currentUserId = auth.currentUser.uid;

      const reviewQuery = query(
        collection(firestore, "reviews"),
        where("userId", "==", user.userId),
        where("reviewerId", "==", currentUserId)
      );

      const reviewSnapshot = await getDocs(reviewQuery);

      if (!reviewSnapshot.empty) {
        // eslint-disable-next-line no-unused-vars
        const existingReview = reviewSnapshot.docs[0].data();
        const { value: edit } = await Swal.fire({
          title: "Already Reviewed",
          text: "You recently reviewed this seller, do you want to edit your review?",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#008080",
          cancelButtonText: "No",
          confirmButtonText: "Yes",
        });

        if (!edit) return;
      }

      const { value: formValues } = await Swal.fire({
        title: "Write your review",
        showCancelButton: true,
        confirmButtonColor: "#008080",
        cancelButtonText: "Cancel",
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        html: `
        <div class="rating">
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" value="1" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" value="2" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" value="3" checked />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" value="4" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" value="5" />
        </div>
        <textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Your review here..."></textarea>
      `,
        focusConfirm: false,
        preConfirm: async () => {
          const review = document.getElementById("swal-input2").value;
          const rating = document.querySelector(
            'input[name="rating-2"]:checked'
          ).value;

          if (!review) {
            Swal.showValidationMessage("Please write your review.");
            return false;
          }

          try {
            const reviewData = {
              review,
              rating,
              userId: user.userId,
              reviewerId: currentUserId,
              timestamp: serverTimestamp(),
            };

            if (!reviewSnapshot.empty) {
              const existingReviewId = reviewSnapshot.docs[0].id;
              await setDoc(
                doc(firestore, "reviews", existingReviewId),
                reviewData
              );
            } else {
              await addDoc(collection(firestore, "reviews"), reviewData);
            }

            return true;
          } catch (error) {
            console.error("Error submitting review:", error);
            Swal.fire({
              title: "Error",
              text: "An error occurred while submitting your review.",
              icon: "error",
            });
            return false;
          }
        },
      });

      if (formValues) {
        Swal.fire({
          title: "Review Submitted!",
          text: "Thank you for your review.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while submitting your review.",
        icon: "error",
      });
    }
  };

  return (
    <div className="md:max-w-full max-w-xl mx-auto md:p-0 p-4">
      {loading ? (
        <div className="h-screen pt-0 w-full grid items-center">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto flex justify-center items-center"
            src={uploadload}
            alt=""
          />
        </div>
      ) : user ? (
        <div className="h-full pt-24 pb-20 w-full ">
          <div className="md:flex ">
            <div className="md:fixed md:w-1/3 md:px-5">
              <div className="bg-bgray md:px-5 mt-2 w-full py-4 px-2 rounded-lg">
                <div className="">
                  <div className="flex justify-end">
                    {user.role !== "Buyer" && (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={handleSubmitReview}
                      >
                        Review this seller
                        <FaStar />
                      </button>
                    )}
                  </div>
                  <h2 className="text-2xl pb-2 md:text-base lg:text-xl text-center font-bold">
                    Viewing Profile
                  </h2>
                </div>
                <div className="w-full">
                  <div className="mb-2 w-full">
                    <img
                      src={user.profilePhotoUrl}
                      alt="Profile"
                      onClick={handleViewProfilePhoto}
                      className="object-cover pointer-events-auto select-all w-48 h-48 lg:w-36 lg:h-36 md:w-28 md:h-28 mx-auto"
                      style={{
                        border: "2px solid #008080",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </div>
                <p className="text-center  text-2xl lg:text-2xl md:text-base mx-auto">
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </p>
                <p className="text-center text-primary pb-2 font-bold text-xs lg:text-base">
                  {user.role}
                </p>
                {user.role !== "Buyer" && (
                  <div className="shadow bg-white rounded-md p-1">
                    <p className="text-center font-bold flex justify-center gap-1 items-center text-sm lg:text-base">
                      <span className="flex gap-1 items-center">
                        <FaStar className="text-yellow-500" />
                        {reviewCount.toFixed(1)}
                      </span>
                      ratings
                    </p>
                    <p className="text-center text-xs italic">
                      {totalReviews} reviews
                    </p>
                    <div className="text-xs text-center">
                      {user.soldProduct ? user.soldProduct : 0} item/s sold.
                    </div>
                  </div>
                )}

                <a
                  href={`mailto:${user.email}`}
                  className="text-xs flex items-center hover:text-primary hover:translate-x-1 transition-all ease-in-out duration-300 py-1  gap-2"
                >
                  <MdOutlineAttachEmail size={15} /> {user.email}
                </a>
                <p className="text-xs flex items-center hover:text-primary  hover:translate-x-1 transition-all ease-in-out duration-300 py-1 gap-2">
                  <CiLocationArrow1 size={15} /> {user.address}
                </p>
                <a
                  href={`tel:${user.contact}`}
                  className="text-xs flex items-center hover:text-primary py-1 hover:translate-x-1 transition-all ease-in-out duration-300 gap-2"
                >
                  <FaPhone size={15} /> {user.contact}
                </a>
                <div className="justify-center w-full flex">
                  <button
                    onClick={handleReportProfile}
                    className="btn  btn-xs btn-error text-white"
                  >
                    Report {user.firstName}
                  </button>
                </div>
              </div>
              <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-2">
                <h1 className="text-lg text-center w-full font-bold pb-2">
                  Want to talk to {user.firstName}?
                </h1>

                <div className="flex justify-center">
                  <button
                    onClick={handleMessageSelect}
                    className="btn-sm md:btn-xs lg:btn-sm btn btn-primary"
                  >
                    Message {user.firstName} now!
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 md:px-5 md:ml-auto">
              <div className="md:fixed md:flex justify-center bg-bgray md:bg-transparent md:w-2/3 md:px-5 mx-auto py-2 rounded-lg my-2">
                <div className="md:glass md:w-full  md:max-w-3xl md:h-20 rounded-lg p-2">
                  <h1 className="text-center font-bold text-black mb-2">
                    {user.firstName}'s posts here
                  </h1>
                  <div className="flex text-xs items-center justify-center">
                    {user.role !== "Buyer" && (
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
                    )}
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
              <div className="md:pt-24">
                {displayProducts ? (
                  <div className="">
                    {userPosts.filter(
                      (post) =>
                        post.type === "product" &&
                        !post.isHidden &&
                        !post.isSold
                    ).length > 0 ? (
                      userPosts
                        .filter(
                          (post) =>
                            post.type === "product" &&
                            !post.isHidden &&
                            !post.isSold
                        )
                        .sort((a, b) => b.productId - a.productId)
                        .map((product, index) => (
                          <div
                            onClick={() => handleProductClick(product.id)}
                            key={index}
                            className={`${
                              product.isHidden ? "relative" : ""
                            } bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer`}
                          >
                            {product.isHidden && (
                              <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex items-center justify-center">
                                <p className="text-white">
                                  This post is hidden due to:{" "}
                                  {product.hideReason}
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2 py-2 items-center w-full justify-between">
                              <div className="flex gap-2 items-center w-full justify-between px-2">
                                <div className="flex gap-4 items-center">
                                  <img
                                    src={user.profilePhotoUrl}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                  <div>
                                    <p className="text-primary text-sm font-semibold">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {product.timestamp}
                                    </p>
                                  </div>
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
                          Oh no! {user.firstName} haven't posted any products
                          yet.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="">
                    {userPosts.filter(
                      (post) => post.type === "recipe" && !post.isHidden
                    ).length > 0 ? (
                      userPosts
                        .filter(
                          (post) => post.type === "recipe" && !post.isHidden
                        )
                        .sort((a, b) => b.recipeId - a.recipeId)
                        .map((recipe, index) => (
                          <div
                            onClick={() => handleRecipeClick(recipe.id)}
                            key={index}
                            className={`${
                              recipe.isHidden ? "relative" : ""
                            } bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer`}
                          >
                            {recipe.isHidden && (
                              <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg flex items-center justify-center">
                                <p className="text-white">
                                  This post is hidden due to:{" "}
                                  {recipe.hideReason}
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2 py-2 items-center w-full justify-between">
                              <div className="flex gap-2 items-center w-full justify-between px-2">
                                <div className="flex gap-4 items-center">
                                  <img
                                    src={user.profilePhotoUrl}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover inline-block"
                                  />
                                  <div>
                                    <p className="text-primary text-sm font-semibold">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {recipe.timestamp}
                                    </p>
                                  </div>
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
                          Oh no! {user.firstName} have no recipes posted yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
