import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";

import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import LogoutModal from "../authentication/LogoutModal";
import { AiOutlineLogout } from "react-icons/ai";
import Swal from "sweetalert2";

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          firstName: data.firstName,
          lastName: data.lastName,
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

  const deleteRecipe = async (recipeId, recipeCaption) => {
    Swal.fire({
      title: `Are you sure you want to delete "${recipeCaption}" from the recipe database?`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const db = firestore;
          const recipeDocRef = doc(db, "recipes", recipeId);
          await deleteDoc(recipeDocRef);
          Swal.fire("Deleted!", "Your recipe has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting recipe:", error);
          Swal.fire(
            "Error!",
            "An error occurred while deleting the recipe.",
            "error"
          );
        }
      }
    });
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    return (
      recipe.recipeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipe.firstName + " " + recipe.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const navigate = useNavigate();

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
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
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-28 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-2xl lg:text-3xl">
                  Admin Panel
                </h1>
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
                <li
                  onClick={toggleLogoutModal}
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
              <div className="py-5">
                <input
                  type="text"
                  placeholder="Search for Caption/Name..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <h1 className="text-center pb-2 text-primary underline text-xs lg:hidden">
                  Swipe left & right to view other data
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
                                className="h-12 w-12 object-cover rounded-md"
                              />
                            ) : (
                              <span>No photo available</span>
                            )}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {recipe.firstName} {recipe.lastName}
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center">
                            <button
                              className="block font-normal btn-sm w-full btn btn-error text-white mt-2"
                              onClick={() =>
                                deleteRecipe(recipe.id, recipe.caption)
                              }
                            >
                              Delete
                            </button>
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
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default AdminRecipes;
