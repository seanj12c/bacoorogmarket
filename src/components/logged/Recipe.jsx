import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import RecipeModal from "./RecipeModal";
import uploadload from "../../assets/loading.gif";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recipesCollection = collection(firestore, "recipes");
    const recipesQuery = query(recipesCollection, orderBy("timestamp", "desc"));

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
    // Disable scrolling when modal is open
    document.body.classList.add("modal-open");
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    // Enable scrolling when modal is closed
    document.body.classList.remove("modal-open");
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
        <div className="grid grid-cols-1 py-24 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer"
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
                    <p className="text-gray-500 text-xs">{recipe.timestamp}</p>
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
      )}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} closeModal={closeRecipeModal} />
      )}
    </div>
  );
};

export default Recipe;
