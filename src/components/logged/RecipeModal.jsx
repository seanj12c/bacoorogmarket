import React from "react";
import { IoMdCloseCircle } from "react-icons/io";

const RecipeModal = ({ recipe, closeModal }) => {
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;

  return (
    <div className="fixed h-screen bg-white inset-0 z-50  flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className="relative w-full mx-auto overflow-y-auto">
        <div className=" md:h-full h-screen border-0 rounded-lg  overflow-y-auto shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center  justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
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
              </div>
            </div>
            <div>
              <button
                className=" text-black md:hidden text-2xl font-semibold focus:outline-none"
                onClick={closeModal}
              >
                <IoMdCloseCircle size={30} className="text-red-500" />
              </button>
              <button
                className="text-primary hidden md:block text-xs sm:text-sm font-semibold py-2 px-6 rounded-full"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto">
            <div className="mb-4">
              <h1 className="text-xl sm:text-xl font-semibold text-primary">
                {recipe.caption}
              </h1>
              {recipe.photos && recipe.photos.length > 0 && (
                <div className="mt-3">
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
              <div className="md:flex">
                {hasIngredients && (
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                      Ingredients:
                    </h2>
                    <ul className="list-disc ml-6 text-xs ">
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
                    <ol className="list-decimal ml-6 text-xs">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="mb-1">
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
    </div>
  );
};

export default RecipeModal;
