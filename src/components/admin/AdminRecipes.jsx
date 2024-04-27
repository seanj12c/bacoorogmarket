import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";

import { FaFile, FaSearch, FaUsers } from "react-icons/fa";
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

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const recipesCollection = collection(firestore, "recipes");
    const recipesQuery = query(recipesCollection, orderBy("recipeId", "desc"));

    const unsubscribe = onSnapshot(recipesQuery, (querySnapshot) => {
      const recipesData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipesData.push({
          id: doc.id,
          recipeId: data.recipeId,
          caption: data.caption,
          photos: data.photos,
          userUid: data.userUid,
          firstName: data.firstName,
          lastName: data.lastName,
          ingredients: data.ingredients,
          instructions: data.instructions,
          timestamp: data.timestamp,

          isHidden: data.isHidden || false, // Initialize isHidden property
          // Add more fields if needed
        });
      });
      setRecipes(recipesData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const registeredCollection = collection(firestore, "registered");
    const unregister = onSnapshot(registeredCollection, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Add more fields if needed
        });
      });
      setUsers(usersData);
    });

    return () => {
      unregister();
    };
  }, []);

  const toggleRecipeVisibility = async (recipeId, isHidden, recipeCaption) => {
    try {
      if (isHidden) {
        const confirmationResult = await Swal.fire({
          title: "Show Recipe",
          text: `Are you sure you want to show "${recipeCaption}"?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        });

        if (confirmationResult.isConfirmed) {
          const recipeDocRef = doc(firestore, "recipes", recipeId);
          await updateDoc(recipeDocRef, {
            isHidden: false,
            hideReason: null, // Clear the hide reason when showing the recipe
          });
          setRecipes((prevRecipes) =>
            prevRecipes.map((recipe) =>
              recipe.id === recipeId
                ? { ...recipe, isHidden: false, hideReason: null }
                : recipe
            )
          );
          Swal.fire("Success!", `Recipe has been shown.`, "success");
        }
        return;
      }

      const { value: reason } = await Swal.fire({
        title: "Hide Recipe",
        input: "select",
        inputLabel: "Select a reason",
        inputOptions: {
          "Inappropriate Content": "Inappropriate Content",
          "Misleading Information": "Misleading Information",
          "Copyright Infringement": "Copyright Infringement",
          "Safety Concerns": "Safety Concerns",
          "Spam or Scams": "Spam or Scams",
          "Violation of Community Guidelines":
            "Violation of Community Guidelines",
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonText: "Hide",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          return !value && "You need to select a reason!";
        },
      });

      if (reason) {
        const recipeDocRef = doc(firestore, "recipes", recipeId);
        await updateDoc(recipeDocRef, {
          isHidden: true,
          hideReason: reason, // Store the hide reason in Firestore
        });
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === recipeId
              ? { ...recipe, isHidden: true, hideReason: reason }
              : recipe
          )
        );
        Swal.fire("Success!", `Recipe has been hidden.`, "success");
      }
    } catch (error) {
      console.error("Error updating recipe visibility:", error);
      Swal.fire(
        "Error!",
        "An error occurred while updating recipe visibility.",
        "error"
      );
    }
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    return (
      recipe.recipeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (users.find((user) => user.id === recipe.userUid) &&
        `${users.find((user) => user.id === recipe.userUid).firstName} ${
          users.find((user) => user.id === recipe.userUid).lastName
        }`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
    );
  });

  const navigate = useNavigate();

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

  const openModal = (recipeId) => {
    const modal = document.getElementById(`view_recipe_${recipeId}`);
    modal.showModal();
  };

  const closeModal = (recipeId) => {
    const modal = document.getElementById(`view_recipe_${recipeId}`);
    modal.close();
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
              users="bg-white text-primary "
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-primary text-white"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
              deletions="bg-white text-primary"
              accinfos="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
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
                  <li className="bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <MdOutlineRestaurantMenu size={25} className="text-white" />
                    Recipes
                  </li>
                </Link>
                <Link to="/admin/appeal">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
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
                <li
                  onClick={handleLogoutConfirmation}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>
            {/* Recipe Management Table */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                Recipe Management
              </h1>
              <div className="border-primary  border w-full  px-2 flex items-center gap-2 rounded-md ">
                <FaSearch size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search for Caption/Name..."
                  className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <h1 className="text-center pb-2 text-primary underline text-xs lg:hidden">
                  Swipe to view other data
                </h1>
                <h1 className="text-center pb-2 text-primary underline text-xs hidden lg:block">
                  Scroll to view other data
                </h1>
              </div>

              <div className="overflow-y-auto max-h-[450px]">
                {filteredRecipes.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No recipes found for "{searchQuery}". Please try a different
                    search.
                  </p>
                ) : (
                  <table className="mx-auto table table-xs border-collapse">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-4 py-2 text-xs text-center">
                          Caption
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Photo
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Name
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipes.map((recipe) => (
                        <tr key={recipe.id}>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {recipe.caption}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {recipe.photos && recipe.photos.length > 0 ? (
                              <img
                                src={recipe.photos[0]}
                                alt={recipe.caption}
                                className="w-12 h-12 mx-auto object-cover rounded-md"
                              />
                            ) : (
                              <span>No photo available</span>
                            )}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {users.find((user) => user.id === recipe.userUid)
                              ? `${
                                  users.find(
                                    (user) => user.id === recipe.userUid
                                  ).firstName
                                } ${
                                  users.find(
                                    (user) => user.id === recipe.userUid
                                  ).lastName
                                }`
                              : "User Not Found"}
                          </td>

                          <td className="border flex flex-col gap-2 bg-gray-200 border-gray-300 px-4 py-2 text-center">
                            <button
                              className={`block font-normal btn-sm w-full btn ${
                                recipe.isHidden ? "btn-success" : "btn-error"
                              } text-white mt-2`}
                              onClick={() =>
                                toggleRecipeVisibility(
                                  recipe.id,
                                  recipe.isHidden,
                                  recipe.caption
                                )
                              }
                            >
                              {recipe.isHidden ? "Show" : "Hide"}
                            </button>
                            {/* You can open the modal using document.getElementById('ID').showModal() method */}
                            <button
                              className="btn btn-primary btn-sm w-full"
                              onClick={() => openModal(recipe.id)}
                            >
                              Other Details
                            </button>

                            <dialog
                              id={`view_recipe_${recipe.id}`}
                              className="modal"
                            >
                              <div className="modal-box">
                                <form method="dialog">
                                  {/* if there is a button in form, it will close the modal */}
                                  <button
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                    onClick={() => closeModal(recipe.id)}
                                  >
                                    ✕
                                  </button>
                                </form>
                                <h3 className="font-bold text-lg">
                                  {recipe.caption}
                                </h3>
                                <div className="text-start">
                                  <p className="">
                                    <span className="font-bold">
                                      Posted by:
                                    </span>{" "}
                                    {recipe.firstName} {recipe.lastName}
                                  </p>

                                  <p className="">
                                    <span className="font-bold">
                                      Ingredients:
                                    </span>
                                    {recipe.ingredients.map(
                                      (ingredient, index) => (
                                        <li key={index}>{ingredient}</li>
                                      )
                                    )}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">
                                      Instructions:
                                    </span>
                                    {recipe.instructions.map(
                                      (instruction, index) => (
                                        <li
                                          className="list-decimal"
                                          key={index}
                                        >
                                          {instruction}
                                        </li>
                                      )
                                    )}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">Date:</span>{" "}
                                    {recipe.timestamp}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">
                                      Other Information:
                                    </span>{" "}
                                    {recipe.otherInformation ||
                                      "No other information provided"}
                                  </p>
                                </div>
                                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 xl:grid-cols-3">
                                  {/* Display photos */}
                                  {recipe.photos &&
                                    recipe.photos.map((photo, index) => (
                                      <img
                                        key={index}
                                        src={photo}
                                        alt={`Recipe ${index + 1}`}
                                        className="h-40 w-full object-cover rounded-md"
                                      />
                                    ))}
                                </div>
                              </div>
                            </dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecipes;
