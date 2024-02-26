import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import RecipeModal from "./RecipeModal";
import uploadload from "../../assets/loading.gif";
import { FaSearch } from "react-icons/fa";
import { MdOutlinePostAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import bannerre from "../../assets/bannerre.jpg";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
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
          profilePhotoUrl: data.profilePhotoUrl,
          firstName: data.firstName,
          lastName: data.lastName,
          timestamp: data.timestamp,
          caption: data.caption,
          ingredients: data.ingredients,
          instructions: data.instructions,
          photos: data.photos,
          recipeId: data.recipeId, // Assuming you have a field called recipeId
        });
      });
      setRecipes(recipesData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    document.body.classList.add("modal-open");
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    document.body.classList.remove("modal-open");
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const searchLowerCase = searchQuery.toLowerCase();
    return (
      recipe.firstName.toLowerCase().includes(searchLowerCase) ||
      recipe.lastName.toLowerCase().includes(searchLowerCase) ||
      recipe.caption.toLowerCase().includes(searchLowerCase) ||
      recipe.ingredients.join(" ").toLowerCase().includes(searchLowerCase) ||
      recipe.instructions.join(" ").toLowerCase().includes(searchLowerCase)
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
        <div className="py-24">
          <div>
            <img
              src={bannerre}
              className="w-full h-20 md:h-32 lg:h-44 object-cover"
              alt=""
            />
          </div>
          <div className="flex py-2 w-full justify-center items-center gap-2 px-4">
            <div className="border-primary border w-full px-2 flex items-center gap-2 rounded-md ">
              <FaSearch size={20} className="text-primary" />
              <input
                type="search"
                placeholder="Search by recipe name, caption, or ingredients..."
                className="outline-none text-xs md:text-base w-full h-8 md:h-10"
                onChange={handleSearch}
              />
            </div>
            <Link to="/post_recipe">
              <div className="flex flex-col items-center border w-28 md:w-36 border-primary bg-primary rounded-lg">
                <MdOutlinePostAdd className="text-white" size={18} />
                <p className="text-center text-xs md:text-base text-white">
                  Post a Recipe
                </p>
              </div>
            </Link>
          </div>
          <div className="grid grid-cols-1 px-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-post rounded-lg shadow p-4 cursor-pointer"
                onClick={() => openRecipeModal(recipe)}
              >
                <div className="flex gap-2 py-2 items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <img
                      src={recipe.profilePhotoUrl}
                      alt="ProfilePhoto"
                      className="w-12 h-12 rounded-full object-cover inline-block"
                    />
                    <div>
                      <p className="text-primary text-sm font-semibold">
                        {recipe.firstName} {recipe.lastName}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {recipe.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold mb-2">
                    {recipe.caption}
                  </h1>
                </div>
                <div>
                  <img
                    className="w-full h-36 object-cover rounded-lg mb-2"
                    src={recipe.photos}
                    alt=""
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} closeModal={closeRecipeModal} />
      )}
    </div>
  );
};

export default Recipe;
