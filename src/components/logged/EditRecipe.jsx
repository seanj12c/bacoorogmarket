import React, { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { useNavigate, useParams } from "react-router-dom";
import uploadload from "../../assets/loading.gif";

import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import { IoReturnDownBackOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const EditRecipe = () => {
  const { recipeId } = useParams();

  const [recipeData, setRecipeData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState(true); // Add loading state
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const recipeDoc = await getDoc(doc(firestore, "recipes", recipeId));
        if (recipeDoc.exists()) {
          setRecipeData(recipeDoc.data());
        } else {
          console.log("Recipe document not found!");
        }
      } catch (error) {
        console.error("Error fetching recipe data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipeData();
  }, [recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateDoc(doc(firestore, "recipes", recipeId), recipeData);
      Swal.fire({
        icon: "success",
        title: "Recipe Updated!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate(`/recipe`);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error adding recipe: ", error);
      // Show SweetAlert for error
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again later.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipeData({
      ...recipeData,
      [name]: value,
    });
  };

  const handleAddIngredient = () => {
    setRecipeData({
      ...recipeData,
      ingredients: [...recipeData.ingredients, ""],
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...recipeData.ingredients];
    updatedIngredients.splice(index, 1);
    setRecipeData({
      ...recipeData,
      ingredients: updatedIngredients,
    });
  };

  const handleAddInstruction = () => {
    setRecipeData({
      ...recipeData,
      instructions: [...recipeData.instructions, ""],
    });
  };

  const handleRemoveInstruction = (index) => {
    const updatedInstructions = [...recipeData.instructions];
    updatedInstructions.splice(index, 1);
    setRecipeData({
      ...recipeData,
      instructions: updatedInstructions,
    });
  };

  const handleSlideshowChange = (direction) => {
    const lastIndex = recipeData.photos.length - 1;
    setSlideshowIndex((prevIndex) =>
      direction === "prev"
        ? prevIndex > 0
          ? prevIndex - 1
          : lastIndex
        : prevIndex < lastIndex
        ? prevIndex + 1
        : 0
    );
  };

  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // This will navigate back in the history stack
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
        <div className="p-4 md:pb-0 pb-20 sm:p-6 md:p-8 lg:p-10">
          <div className="pt-24 ">
            <button
              className="btn btn-xs md:btn-sm btn-error text-white btn-primary"
              onClick={goBack}
            >
              Go Back{" "}
              <IoReturnDownBackOutline className="md:hidden" size={15} />
              <IoReturnDownBackOutline className="hidden md:block" size={20} />
            </button>{" "}
            <h2 className="text-2xl text-center font-bold text-primary ">
              Edit Recipe
            </h2>
          </div>

          {recipeData.photos && recipeData.photos.length > 0 && (
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                <div>
                  <img
                    src={recipeData.photos[slideshowIndex]}
                    alt={` AS23A ${slideshowIndex + 1}`}
                    className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                  />
                  <img
                    src={recipeData.photos[slideshowIndex]}
                    alt={`AS23A ${slideshowIndex + 1}`}
                    className="w-full max-w-md mx-auto h-56 sm:h-64 p-1 lg:h-72 object-contain rounded-lg relative z-10"
                  />
                </div>
              </div>
              <h1 className="text-error mb-3 text-xs text-center">
                Sorry, image can't be edited.
              </h1>
              <div className="flex justify-center gap-20 pb-5 w-full">
                <button
                  onClick={() => handleSlideshowChange("prev")}
                  className="text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle btn-primary "
                >
                  <BiSolidSkipPreviousCircle />
                </button>
                <button
                  onClick={() => handleSlideshowChange("next")}
                  className="text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle btn-primary "
                >
                  <BiSolidSkipNextCircle />
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg text-primary">Caption</h3>
            <input
              type="text"
              name="recipeName"
              className="w-full border rounded p-2 mb-4"
              placeholder="Recipe Name"
              value={recipeData.caption || ""}
              onChange={handleChange}
              required
            />
            {/* Ingredients */}
            <div className="mb-4">
              <h3 className="text-lg text-primary">Ingredients</h3>
              {recipeData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    placeholder={`Ingredient #${index + 1}`}
                    value={ingredient}
                    onChange={(e) => {
                      const updatedIngredients = [...recipeData.ingredients];
                      updatedIngredients[index] = e.target.value;
                      setRecipeData({
                        ...recipeData,
                        ingredients: updatedIngredients,
                      });
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-primary ml-2 hover:text-primary-dark cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-primary hover:text-primary-dark cursor-pointer"
              >
                Add Ingredient
              </button>
            </div>
            {/* Instructions */}
            <div className="mb-4">
              <h3 className="text-lg text-primary">Instructions</h3>
              {recipeData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-full border rounded p-2"
                    placeholder={`Instruction #${index + 1}`}
                    value={instruction}
                    onChange={(e) => {
                      const updatedInstructions = [...recipeData.instructions];
                      updatedInstructions[index] = e.target.value;
                      setRecipeData({
                        ...recipeData,
                        instructions: updatedInstructions,
                      });
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(index)}
                    className="text-primary ml-2 hover:text-primary-dark cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInstruction}
                className="text-primary hover:text-primary-dark cursor-pointer"
              >
                Add Instruction
              </button>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="btn-wide btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Recipe"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditRecipe;
