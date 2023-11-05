import React from "react";

const RecipeModal = ({ recipe, closeModal }) => {
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;

  return (
    <div className="fixed inset-0 z-50 mt-24 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className="relative w-full mx-auto my-6 pt-64 overflow-y-auto">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <div className="flex items-center">
              <img
                src={recipe.profilePhotoUrl}
                alt="ProfilePhoto"
                className="w-16 h-16 rounded-full object-cover inline-block"
              />
              <div className="ml-4">
                <p className="text-primary text-xs sm:text-sm font-semibold">
                  {recipe.firstName} {recipe.lastName}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {recipe.timestamp}
                </p>
              </div>
            </div>
            <button
              className="p-2 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closeModal}
            >
              <span className="bg-transparent text-black opacity-5 h-8 w-8 text-xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-primary">
                {recipe.name}
              </h1>
              {hasIngredients && (
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                    Ingredients:
                  </h2>
                  <ul className="list-disc ml-6 text-xs md:text-base sm:text-xl">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="mb-1">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasInstructions && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                    Instructions:
                  </h2>
                  <ol className="list-decimal ml-6 text-xs md:text-base sm:text-xl">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="mb-1">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {recipe.photos && recipe.photos.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                    Photos:
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recipe.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Recipe-Photos ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
            <button
              className="text-primary text-xs sm:text-sm font-semibold py-2 px-6 rounded-full"
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
