import React from "react";

const RecipeModal = ({ recipe, closeModal }) => {
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        {/* Modal content */}
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <div className="flex items-center">
              <img
                src={recipe.profilePhotoUrl}
                alt="ProfilePhoto"
                className="w-12 h-12 rounded-full object-cover inline-block"
              />
              <div className="ml-4">
                <p className="text-primary text-sm font-semibold">
                  {recipe.firstName} {recipe.lastName}
                </p>
                <p className="text-gray-500 text-xs">{recipe.timestamp}</p>
              </div>
            </div>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closeModal}
            >
              <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold mb-2">{recipe.name}</h1>
              {hasIngredients && (
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Ingredients:</h2>
                  <ul className="list-decimal ml-6">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              {hasInstructions && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
                  <ol className="list-decimal ml-6">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
            <button
              className="text-primary text-sm font-semibold py-2 px-6 rounded-full"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
