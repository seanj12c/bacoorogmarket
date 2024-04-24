import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";

import uploadload from "../../assets/loading.gif";
import { FaSearch } from "react-icons/fa";
import { MdOutlinePostAdd, MdOutlineSort } from "react-icons/md";
import { Link } from "react-router-dom";
import bannerre from "../../assets/bannerre.jpg";

const Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  useEffect(() => {
    const recipesCollection = collection(firestore, "recipes");
    const recipesQuery = query(recipesCollection, orderBy("recipeId", "desc"));

    const unsubscribe = onSnapshot(recipesQuery, async (querySnapshot) => {
      const recipesData = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        // Check if the recipe is not hidden and not deactivated
        if (!data.isHidden && !data.accountDeactivated) {
          const userData = await getUserData(data.userUid);
          recipesData.push({
            id: doc.id,
            profilePhotoUrl: userData.profilePhotoUrl,
            firstName: userData.firstName,
            lastName: userData.lastName,
            timestamp: data.timestamp,
            caption: data.caption,
            ingredients: data.ingredients,
            instructions: data.instructions,
            photos: data.photos,
            recipeId: data.recipeId,
            userUid: data.userUid,
            likers: data.likers ? data.likers.length : 0, // Assuming likers is an array
            recipeType: data.recipeType,
          });
        }
      }
      // Sort recipes based on number of likers in descending order
      recipesData.sort((a, b) => b.likers - a.likers);
      setRecipes(recipesData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function getUserData(userUid) {
    const userDocRef = doc(firestore, "registered", userUid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.data();
  }

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const searchLowerCase = searchQuery.toLowerCase();
    return (
      (recipe.firstName.toLowerCase().includes(searchLowerCase) ||
        recipe.lastName.toLowerCase().includes(searchLowerCase) ||
        recipe.caption.toLowerCase().includes(searchLowerCase) ||
        recipe.ingredients.join(" ").toLowerCase().includes(searchLowerCase) ||
        recipe.instructions
          .join(" ")
          .toLowerCase()
          .includes(searchLowerCase)) &&
      (selectedSort === "" ||
        recipe.recipeType.toLowerCase() === selectedSort.toLowerCase())
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
            <div className="md:block hidden">
              <div className="flex justify-between px-2 items-center border p-1 border-primary bg-primary rounded-lg">
                <div className="flex items-center pr-3 gap-2">
                  <MdOutlineSort className="text-white text-3xl" />
                  <h3 className="text-xs sm:text-base text-white">Sort: </h3>
                </div>
                <select
                  className="rounded-sm outline-none bg-primary text-lg sm:text-base border border-white text-white"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="">-None-</option>
                  <option value="Tahong">Tahong</option>
                  <option value="Talaba">Talaba</option>
                </select>
              </div>
            </div>
            <div className="border-primary border bg-[#FFFFFF] w-full px-2 flex items-center gap-2 rounded-md ">
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
                <p className="text-center  text-xs md:text-base text-white">
                  Post a Recipe
                </p>
              </div>
            </Link>
          </div>
          <div className="px-4 pb-2 md:hidden">
            <div className="flex justify-between items-center border p-1 border-primary bg-primary rounded-lg">
              <div className="flex items-center gap-2">
                <MdOutlineSort className="text-white text-2xl sm:text-4xl" />
                <h3 className="text-xs sm:text-base text-white">Sort: </h3>
              </div>
              <select
                className="rounded-sm outline-none bg-primary text-xs sm:text-base border border-white text-white"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="">-None-</option>
                <option value="Tahong">Tahong</option>
                <option value="Talaba">Talaba</option>
              </select>
            </div>
          </div>

          {filteredRecipes.length === 0 ? (
            <p className="text-center text-gray-500">
              No recipe found for "{searchQuery}". Please try a different
              search.
            </p>
          ) : (
            <div className="grid grid-cols-1 px-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipe/info/${recipe.id}`}>
                  <div
                    key={recipe.id}
                    className="glass rounded-lg shadow p-4 cursor-pointer"
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
                      <div className="stats justify-center shadow overflow-hidden">
                        <div className="stat">
                          <div className="stat-title text-xs">Total Likes</div>
                          <div className="stat-value text-end text-sm text-primary">
                            {recipe.likers} ♡
                          </div>
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
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recipe;
