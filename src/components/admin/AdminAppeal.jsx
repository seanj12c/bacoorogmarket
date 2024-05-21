import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaSearch, FaStar, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import {
  MdNoAccounts,
  MdOutlineReport,
  MdOutlineRestaurantMenu,
} from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";

import Swal from "sweetalert2";
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminAppeal = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appeals, setAppeals] = useState([]);
  const [reportType, setReportType] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const db = getFirestore();
        let appealRef = collection(db, "userAppeal");

        if (reportType === "recipe" || reportType === "product") {
          appealRef = collection(db, "postAppeal");
        }

        const snapshot = await getDocs(appealRef);
        const appealData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            if (doc.id !== "sample") {
              if (reportType === "recipe" || reportType === "product") {
                const postData = doc.data();
                if (postData.typeOfPost === reportType) {
                  const userData = await getUserData(postData.userId);
                  return {
                    id: doc.id,
                    email: userData.email,
                    explanation: postData.explanation,
                    userData: userData,
                    postId: postData.postId,
                  };
                } else {
                  return null;
                }
              } else {
                const userData = await getUserData(doc.data().userId);
                return {
                  id: doc.id,
                  email: userData.email,
                  reason: doc.data().reason,
                  userData: userData,
                };
              }
            }
            return null;
          })
        );
        setAppeals(appealData.filter((appeal) => appeal !== null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appeals:", error);
      }
    };

    fetchAppeals();
  }, [reportType]);

  const reloadWindow = () => {
    window.location.reload();
  };

  const getUserData = async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "registered", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("No such user document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const enableUser = async (userId) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "Once enabled, the user will be able to access the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, enable it!",
      });

      if (confirmed.isConfirmed) {
        const db = getFirestore();

        const disabledReasonRef = doc(db, "disabledReason", userId);
        await deleteDoc(disabledReasonRef);

        const userAppealRef = doc(db, "userAppeal", userId);
        await deleteDoc(userAppealRef);

        const userDocRef = doc(db, "registered", userId);
        await updateDoc(userDocRef, {
          disabled: false,
        });

        console.log("User enabled successfully.");

        const updatedSnapshot = await getDocs(collection(db, "userAppeal"));
        const updatedData = await Promise.all(
          updatedSnapshot.docs.map(async (doc) => {
            if (doc.id !== "sample") {
              const userData = await getUserData(doc.data().userId);
              return {
                id: doc.id,
                email: doc.data().email,
                reason: doc.data().reason,
                userData: userData,
              };
            }
            return null;
          })
        );
        setAppeals(updatedData.filter((appeal) => appeal !== null));

        // Show success message
        Swal.fire("Enabled!", "The user has been enabled.", "success");
        reloadWindow();
      }
    } catch (error) {
      console.error("Error enabling user:", error);
      // Show error message
      Swal.fire(
        "Error",
        "Failed to enable the user. Please try again later.",
        "error"
      );
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const filteredAppeals = appeals.filter((appeal) => {
    const query = searchQuery.toLowerCase();
    return (
      appeal.userData.firstName.toLowerCase().includes(query) ||
      appeal.userData.lastName.toLowerCase().includes(query) ||
      appeal.email.toLowerCase().includes(query)
    );
  });

  const handleEnableRecipe = async (postId, id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "Once enabled, the recipe will be visible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#008080",

      confirmButtonText: "Yes, enable it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const db = getFirestore();

        const recipeDocRef = doc(db, "recipes", postId);
        await updateDoc(recipeDocRef, {
          isHidden: false,
        });

        const appealDocRef = doc(db, "postAppeal", id);
        await deleteDoc(appealDocRef);

        console.log("Recipe enabled successfully.");

        Swal.fire("Enabled!", "The recipe has been enabled.", "success");
        reloadWindow();
      } catch (error) {
        console.error("Error enabling recipe:", error);

        Swal.fire(
          "Error",
          "Failed to enable the recipe. Please try again later.",
          "error"
        );
      }
    }
  };

  const handleEnableProduct = async (postId, id) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "Once enabled, the product will be visible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#008080",

      confirmButtonText: "Yes, enable it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const db = getFirestore();

        const productDocRef = doc(db, "products", postId);
        await updateDoc(productDocRef, {
          isHidden: false,
        });

        const appealDocRef = doc(db, "postAppeal", id);
        await deleteDoc(appealDocRef);

        console.log("Product enabled successfully.");

        Swal.fire("Enabled!", "The product has been enabled.", "success");
        reloadWindow();
      } catch (error) {
        console.error("Error enabling product:", error);

        Swal.fire(
          "Error",
          "Failed to enable the product. Please try again later.",
          "error"
        );
      }
    }
  };

  const handleOpenModal = async (postId) => {
    try {
      const db = getFirestore();
      let modalContent = "";

      if (reportType === "recipe") {
        const recipeDocRef = doc(db, "recipes", postId);
        const recipeDoc = await getDoc(recipeDocRef);

        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();
          let otherInfo =
            recipeData.otherInformation || "No other information provided";
          let photos = Array.isArray(recipeData.photos)
            ? recipeData.photos
            : [recipeData.photos];

          modalContent = `
    <h3 class="font-bold text-center text-lg">${recipeData.caption}</h3>
    <p><strong>Ingredients:</strong></p>
    <ul class="list-disc">
      ${recipeData.ingredients
        .map((ingredient) => `<li>${ingredient}</li>`)
        .join("")}
    </ul>
    <p><strong>Instructions:</strong></p>
    <ol class="list-decimal">
      ${recipeData.instructions
        .map((instruction) => `<li>${instruction}</li>`)
        .join("")}
    </ol>
    <p><strong>Date:</strong> ${recipeData.timestamp}</p>
    <p><strong>Other Information:</strong> ${otherInfo}</p>
    <div class="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 xl:grid-cols-3">
      ${photos
        .map(
          (photo) =>
            `<img src="${photo}" alt="Recipe Photo" class="h-40 w-full object-cover rounded-md" />`
        )
        .join("")}
    </div>
  `;
        } else {
          modalContent = "<p>No recipe found</p>";
        }
      } else if (reportType === "product") {
        const productDocRef = doc(db, "products", postId);
        const productDoc = await getDoc(productDocRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          let otherInfo =
            productData.otherInformation || "No other information provided";
          let photos = Array.isArray(productData.photos)
            ? productData.photos
            : [productData.photos];
          modalContent = `
            <h3 class="font-bold text-center text-lg">${
              productData.caption
            } </h3>
            <p><strong>Address:</strong> ${productData.address}</p>
            <p><strong>Description:</strong> ${productData.description}</p>
            <p><strong>Date:</strong> ${productData.timestamp}</p>
            <p><strong>Price:</strong> ₱${productData.price}</p>
            <p><strong>Other Information:</strong> ${otherInfo}</p>
           <div class="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 xl:grid-cols-3">
      ${photos
        .map(
          (photo) =>
            `<img src="${photo}" alt="Recipe Photo" class="h-40 w-full object-cover rounded-md" />`
        )
        .join("")}
    </div>
          `;
        } else {
          modalContent = "<p>No product found</p>";
        }
      }

      document.getElementById("modalContent").innerHTML = modalContent;
      document.getElementById("modal").showModal();
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const goToInfo = (userId) => {
    navigate(`/admin/info/user/${userId}`);
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
        <div className="h-screen md:pt-0 pt-24 w-full">
          <div className="md:hidden">
            <NavbarAdmin
              users="bg-white text-primary"
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-primary text-white "
              reports="bg-white text-primary"
              deletions="bg-white text-primary"
              accinfos="bg-white text-primary"
              ratings="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-6">
                <Link to="/admin/users">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaUsers size={25} />
                    Users
                  </li>
                </Link>
                <Link to="/admin/locations">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <LiaSearchLocationSolid size={25} className="" />
                    Locations
                  </li>
                </Link>
                <Link to="/admin/products">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <GiMussel size={25} />
                    Products
                  </li>
                </Link>
                <Link to="/admin/recipes">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineRestaurantMenu size={25} />
                    Recipes
                  </li>
                </Link>
                <Link to="/admin/appeal">
                  <li className=" bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <FaFile size={25} />
                    Appeal
                  </li>
                </Link>
                <Link to="/admin/reports">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineReport size={25} />
                    Reports
                  </li>
                </Link>
                <Link to="/admin/delete/user">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <RiDeleteBin6Line size={25} />
                    Deletion Requests
                  </li>
                </Link>
                <Link to="/admin/delete/info">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdNoAccounts size={25} />
                    Deleted Acc Info
                  </li>
                </Link>
                <Link to="/admin/sellers/ratings">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaStar size={25} />
                    Sellers Ratings
                  </li>
                </Link>
                <li
                  onClick={handleLogoutConfirmation}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>

            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h2 className="text-2xl text-center font-bold mt-8">Appeals</h2>
              <div className="w-full flex gap-2 items-center justify-end mt-4">
                <h1 className="text-xs">Type of Appeal</h1>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md bg-base-100 text-sm focus:outline-none focus:border-blue-500"
                  value={reportType}
                  onChange={handleReportTypeChange}
                >
                  <option value="">Account Appeal</option>
                  <option value="recipe">Recipe Appeal</option>
                  <option value="product">Product Appeal</option>
                </select>
              </div>
              <div className="border-primary mt-2 border w-full  px-2 flex items-center gap-2 rounded-md ">
                <FaSearch size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search by name or reason"
                  className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <ul className="mt-4">
                {filteredAppeals.length === 0 ? (
                  <div className="flex w-full items-center flex-col justify-center mt-4">
                    <p className="text-xl md:text-2xl ml-4">
                      There are no Appeals
                    </p>
                  </div>
                ) : (
                  filteredAppeals.map((appeal) => (
                    <li
                      key={appeal.id}
                      className="card glass rounded-lg mb-2 p-3"
                    >
                      <div className="flex justify-between items-center">
                        {appeal.userData && (
                          <div className="flex items-center gap-2">
                            <img
                              src={appeal.userData.profilePhotoUrl}
                              alt="Profile"
                              className="md:w-14 md:h-14  w-10 h-10 border border-primary rounded-full object-cover inline-block ml-2"
                            />{" "}
                            {appeal.userData.firstName}{" "}
                            {appeal.userData.lastName}
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row gap-2">
                          {reportType === "" && (
                            <button
                              onClick={() => enableUser(appeal.userData.userId)}
                              className="btn btn-success btn-xs md:btn-md text-white"
                            >
                              Enable User
                            </button>
                          )}
                          {reportType === "" && (
                            <button
                              onClick={() => goToInfo(appeal.userData.userId)}
                              className="btn btn-primary btn-xs md:btn-md text-white"
                            >
                              View Profile
                            </button>
                          )}
                          {reportType === "recipe" ? (
                            <button
                              onClick={() =>
                                handleEnableRecipe(appeal.postId, appeal.id)
                              }
                              className="btn btn-success btn-xs md:btn-md text-white"
                            >
                              Enable Recipe
                            </button>
                          ) : (
                            reportType === "product" && (
                              <button
                                onClick={() =>
                                  handleEnableProduct(appeal.postId, appeal.id)
                                }
                                className="btn btn-success btn-xs md:btn-md text-white"
                              >
                                Enable Product
                              </button>
                            )
                          )}
                          {reportType === "recipe" ? (
                            <button
                              onClick={() => handleOpenModal(appeal.postId)}
                              className="btn btn-primary btn-xs md:btn-md text-white"
                            >
                              View Recipe
                            </button>
                          ) : (
                            reportType === "product" && (
                              <button
                                onClick={() => handleOpenModal(appeal.postId)}
                                className="btn btn-primary btn-xs md:btn-md text-white"
                              >
                                View Product
                              </button>
                            )
                          )}
                        </div>
                        {selectedAppeal && (
                          <dialog id="view_" className="modal">
                            <div className="modal-box">
                              <form method="dialog">
                                <button
                                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                  onClick={() => {
                                    setSelectedAppeal(null);
                                    document.getElementById("view_").close();
                                  }}
                                >
                                  ✕
                                </button>
                              </form>

                              <h3 className="font-bold text-lg">
                                Appeal Details
                              </h3>
                              <p className="py-4">
                                Press ESC key or click on ✕ button to close
                              </p>

                              {selectedAppeal && selectedAppeal.userData && (
                                <div>
                                  <p>
                                    <strong>User:</strong>{" "}
                                    {`${selectedAppeal.userData.firstName} ${selectedAppeal.userData.lastName}`}
                                  </p>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {selectedAppeal.email}
                                  </p>
                                  <p>
                                    <strong>Explanation:</strong>{" "}
                                    {selectedAppeal.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </dialog>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm md:text-base">
                        <div>
                          <strong>Email:</strong> {appeal.email}
                        </div>
                        {reportType === "recipe" || reportType === "product" ? (
                          <div>
                            <strong>Explanation:</strong> {appeal.explanation}
                          </div>
                        ) : (
                          <div>
                            <strong>Reason:</strong> {appeal.reason}
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      <dialog id="modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("modal").close()}
            >
              ✕
            </button>
          </form>
          <div id="modalContent"></div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminAppeal;
