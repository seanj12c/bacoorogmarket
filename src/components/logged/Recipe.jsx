import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import { HiDotsHorizontal } from "react-icons/hi";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);

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
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          timestamp: data.timestamp,
          photos: data.photos,
        });
      });
      setRecipes(recipesData);
    });

    return () => {
      // Unsubscribe from the real-time updates when the component unmounts
      unsubscribe();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 py-24 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="bg-white rounded-lg shadow p-4">
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
            <div>
              <HiDotsHorizontal className="text-primary" size={20} />
            </div>
          </div>
          <div className="mb-4">
            <h1 className="">{recipe.name}</h1>
            {recipe.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`RecipePhoto ${index + 1}`}
                className="w-full h-36 object-cover rounded-lg mb-2"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recipe;
