import React, { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { useNavigate, useParams } from "react-router-dom";
import uploadload from "../../assets/loading.gif";

const EditRecipe = () => {
  const { recipeId } = useParams();

  const [recipeData, setRecipeData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateDoc(doc(firestore, "recipes", recipeId), recipeData);
      window.alert("Recipe updated successfully!");
      navigate("/recipe");
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
        </div>
      )}
    </div>
  );
};

export default EditRecipe;
