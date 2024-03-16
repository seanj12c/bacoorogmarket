import React, { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { Link, useParams } from "react-router-dom";
import uploadload from "../../assets/loading.gif";
import check from "../../assets/check.gif";

const EditRecipe = () => {
  const { recipeId } = useParams();

  const [recipeData, setRecipeData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateDoc(doc(firestore, "recipes", recipeId), recipeData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error updating recipe: ", error);
    } finally {
      setIsSubmitting(false);
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

  const Modal = ({ show }) => {
    if (!show) {
      return null;
    }

    return (
      <div className="h-screen bg-black px-4 md:px-0 bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
          <h2 className="md:text-2xl text-center text-xl font-semibold my-2">
            Recipe Updated!
          </h2>
          <img className="mx-auto h-20 object-contain" src={check} alt="" />
          <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-6 mt-4">
            <Link
              to="/recipe"
              className="bg-primary text-xs md:text-base text-center text-white px-4 py-2 rounded-lg hover-bg-primary-dark focus:outline-none"
            >
              Go to Recipe Page
            </Link>
            <Link
              to="/myaccount"
              className="bg-primary text-xs md:text-base text-center text-white px-4 py-2 rounded-lg hover-bg-primary-dark focus:outline-none"
            >
              Go to My Account
            </Link>
          </div>
        </div>
      </div>
    );
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
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-primary pt-24 mb-4">
            Edit Recipe
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Render form fields for editing recipe data */}
            <input
              type="text"
              name="recipeName"
              className="w-full border rounded p-2 mb-4"
              placeholder="Recipe Name"
              value={recipeData.caption || ""}
              onChange={handleChange}
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
          <Modal show={isModalOpen} onClose={closeModal} />
        </div>
      )}
    </div>
  );
};

export default EditRecipe;
