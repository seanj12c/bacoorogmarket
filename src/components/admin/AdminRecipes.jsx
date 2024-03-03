import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
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

  const handleOptionsClick = (recipeId, recipe) => {
    setSelectedRecipeId(selectedRecipeId === recipeId ? null : recipeId);
    setSelectedRecipe(selectedRecipe === recipeId ? null : recipe);
  };

  const closeOptions = () => {
    setSelectedRecipeId(null);
    setSelectedRecipe(null);
  };

  const deleteRecipe = (recipeId) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      // Implement delete recipe logic here
      console.log("Delete recipe with ID:", recipeId);
    }
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

              <div className="overflow-auto">
                {filteredRecipes.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No recipes found for "{searchQuery}". Please try a different
                    search.
                  </p>
                ) : (
                  <table className="mx-auto">
                    <thead>
                      <tr>
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
                          <td className="border px-4 py-2 text-center text-xs">
                            {recipe.caption}
                          </td>
                          <td className="border px-4 py-2 text-center text-xs">
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
                          <td className="border px-4 py-2 text-center text-xs">
                            {recipe.firstName} {recipe.lastName}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <div className="relative inline-block">
                              <BsThreeDotsVertical
                                size={20}
                                className="text-primary cursor-pointer"
                                onClick={() =>
                                  handleOptionsClick(recipe.recipeId, recipe)
                                }
                              />
                              {selectedRecipeId === recipe.recipeId && (
                                <div className="absolute top-[-40px] right-[-20px] z-10 bg-white p-2 shadow-md rounded-md mt-2">
                                  <button
                                    className="block w-full py-2 px-1 text-center bg-red-500 text-white rounded-md text-xs hover:bg-red-900 border border-gray-200 mt-2"
                                    onClick={() =>
                                      deleteRecipe(recipe.recipeId)
                                    }
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="block w-full py-2 px-1 text-center rounded-md text-xs hover:bg-gray-200 border border-gray-200 mt-2"
                                    onClick={closeOptions}
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </div>
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
