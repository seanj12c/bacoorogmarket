import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { IoMdCloseCircle } from "react-icons/io";
import {
  BiSolidSkipPreviousCircle,
  BiSolidSkipNextCircle,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import Swal from "sweetalert2";

const RecipeInfo = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false); // State to track whether the current user has liked the recipe
  const [likeCount, setLikeCount] = useState(0); // State to hold the like count
  const auth = useAuth();

  const hasIngredients =
    recipe && recipe.ingredients && recipe.ingredients.length > 0;
  const hasInstructions =
    recipe && recipe.instructions && recipe.instructions.length > 0;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDocRef = doc(firestore, "recipes", recipeId);
        const unsubscribe = onSnapshot(recipeDocRef, (doc) => {
          if (doc.exists()) {
            const recipeData = doc.data();
            setRecipe({ id: doc.id, ...recipeData });
            // Update like count
            setLikeCount(recipeData.likers ? recipeData.likers.length : 0);
            // Check if the current user has already liked the recipe
            setIsLiked(
              recipeData.likers &&
                recipeData.likers.includes(auth.currentUser.uid)
            );
          } else {
            console.log("Recipe not found");
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [recipeId, auth.currentUser]);

  const handleSlideshowChange = (direction) => {
    if (direction === "prev") {
      setSlideshowIndex((prevIndex) =>
        prevIndex === 0 ? recipe.photos.length - 1 : prevIndex - 1
      );
    } else {
      setSlideshowIndex((prevIndex) =>
        prevIndex === recipe.photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleLikeRecipe = async () => {
    const recipeDocRef = doc(firestore, "recipes", recipe.id);
    if (!isLiked) {
      // Add the current user's ID to the likers array
      try {
        await updateDoc(recipeDocRef, {
          likers: arrayUnion(auth.currentUser.uid),
        });
        setIsLiked(true); // Set the like state to true
      } catch (error) {
        console.error("Error liking recipe:", error);
      }
    } else {
      // Remove the current user's ID from the likers array
      try {
        await updateDoc(recipeDocRef, {
          likers: arrayRemove(auth.currentUser.uid),
        });
        setIsLiked(false); // Set the like state to false
      } catch (error) {
        console.error("Error unliking recipe:", error);
      }
    }
  };

  const handleDeleteRecipe = async () => {
    // Using SweetAlert for confirmation
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this recipe!",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(firestore, "recipes", recipe.id));
          Swal.fire("Deleted!", "Your recipe has been deleted.", "success");
          navigate("/recipe"); // Navigate back to previous page after deletion
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

  const handleOpenInNewTab = () => {
    const confirmOpen = window.confirm(
      "Do you want to view this photo in a new tab?"
    );
    if (confirmOpen) {
      window.open(recipe.photos[slideshowIndex], "_blank");
    }
  };

  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // This will navigate back in the history stack
  };

  if (!recipe) {
    return null; // Recipe data is not loaded yet
  }

  const isSeller = auth.currentUser && auth.currentUser.uid === recipe.userUid;

  return (
    <div className="fixed h-screen pb-10 md:pb-5 bg-white inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className="relative w-full mx-auto overflow-y-auto">
        <div className="h-screen border-0 rounded-lg overflow-y-auto shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <div className="flex items-center">
              <img
                src={recipe.profilePhotoUrl}
                alt="ProfilePhoto"
                className="w-8 h-8 md:w-16 md:h-16 rounded-full object-cover inline-block"
              />
              <div className="ml-4">
                <p className="text-primary text-xs sm:text-sm font-semibold">
                  {recipe.firstName} {recipe.lastName}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {recipe.timestamp}
                </p>
                {isSeller ? (
                  <div className="flex items-center gap-2">
                    <div>
                      <Link
                        to={`/edit_recipe/${recipe.id}`}
                        className="btn  btn-xs text-xs btn-primary"
                      >
                        Edit Recipe
                      </Link>
                    </div>

                    <div>
                      <button
                        onClick={handleDeleteRecipe}
                        className="btn text-white  btn-xs text-xs btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/profile/${recipe.userUid}`}
                    className="btn btn-xs text-xs btn-primary"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
            <div>
              <button
                className=" text-black md:hidden text-2xl font-semibold focus:outline-none"
                onClick={goBack}
              >
                <IoMdCloseCircle size={30} className="text-red-500" />
              </button>
              <button
                className="hidden md:block btn btn-primary text-white"
                onClick={goBack}
              >
                Close
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="px-6 md:flex">
            <div className="py-4 px-2">
              <div className="flex justify-between px-2 items-center">
                <div className="stats justify-center shadow">
                  <div className="stat">
                    <div className="stat-title text-xs">Total Likes</div>
                    <div className="stat-value text-end text-sm text-primary">
                      {likeCount} ♡
                    </div>
                  </div>
                </div>

                <div>
                  <button className="btn " onClick={handleLikeRecipe}>
                    {isLiked ? (
                      <h1 className="flex items-center gap-2">
                        Liked
                        <IoHeartSharp size={20} className=" text-red-500" />
                      </h1>
                    ) : (
                      <h1 className="flex items-center gap-2">
                        Like
                        <IoHeartOutline size={20} className=" text-red-500" />
                      </h1>
                    )}
                  </button>
                </div>
              </div>
              <h1 className="text-xl sm:text-xl text-center font-semibold text-primary">
                {recipe.caption}
              </h1>
              <div className="mb-4">
                {recipe.photos && recipe.photos.length > 0 && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                        <div onClick={handleOpenInNewTab}>
                          <img
                            src={recipe.photos[slideshowIndex]}
                            alt={`Recipe-Photos ${slideshowIndex + 1}`}
                            className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                          />

                          <img
                            src={recipe.photos[slideshowIndex]}
                            alt={`Recipe-Photos ${slideshowIndex + 1}`}
                            className="w-full max-w-md mx-auto h-56 sm:h-64 p-1 lg:h-80 object-contain rounded-lg relative z-10"
                          />
                          <h1 className="text-center underline text-xs md:text-base">
                            Click the photo to view in full-screen
                          </h1>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-20 pb-5 w-full">
                      <button
                        onClick={() => handleSlideshowChange("prev")}
                        className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                          recipe.photos && recipe.photos.length > 1
                            ? "btn-primary"
                            : "btn-disabled cursor-not-allowed"
                        }`}
                        disabled={recipe.photos && recipe.photos.length <= 1}
                      >
                        <BiSolidSkipPreviousCircle size={30} />
                      </button>
                      <button
                        onClick={() => handleSlideshowChange("next")}
                        className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                          recipe.photos && recipe.photos.length > 1
                            ? "btn-primary"
                            : "btn-disabled cursor-not-allowed"
                        }`}
                        disabled={recipe.photos && recipe.photos.length <= 1}
                      >
                        <BiSolidSkipNextCircle size={30} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="justify-center w-full">
              {hasIngredients && (
                <div className="mb-4">
                  <h2 className="text-xl text-center font-semibold text-primary mb-2">
                    Ingredients
                  </h2>
                  <ul className="list-disc list-inside">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-base text-gray-800">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasInstructions && (
                <div>
                  <h2 className="text-xl text-center font-semibold text-primary mb-2">
                    Instructions
                  </h2>
                  <ol className="list-decimal list-inside">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="text-base text-gray-800">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
