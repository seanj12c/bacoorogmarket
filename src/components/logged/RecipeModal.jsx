import React, { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import {
  BiSolidSkipPreviousCircle,
  BiSolidSkipNextCircle,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";

const RecipeModal = ({ recipe, closeModal }) => {
  const [slideshowIndex, setSlideshowIndex] = useState(0);

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
  const auth = useAuth();
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;
  const hasInstructions = recipe.instructions && recipe.instructions.length > 0;
  const isSeller = auth.currentUser && auth.currentUser.uid === recipe.userUid;
  const handleOpenInNewTab = () => {
    const confirmOpen = window.confirm(
      "Do you want to view this photo in a new tab?"
    );
    if (confirmOpen) {
      window.open(recipe.photos[slideshowIndex], "_blank");
    }
  };

  return (
    <div className="fixed h-screen bg-white inset-0 z-50  flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className="relative w-full mx-auto overflow-y-auto">
        <div className=" h-screen border-0 rounded-lg  overflow-y-auto shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
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
                {isSeller ? (
                  <Link
                    onClick={closeModal}
                    to={`/edit_recipe/${recipe.id}`}
                    className="btn  btn-xs text-xs btn-primary"
                  >
                    Edit Recipe
                  </Link>
                ) : (
                  <Link
                    onClick={closeModal}
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
                onClick={closeModal}
              >
                <IoMdCloseCircle size={30} className="text-red-500" />
              </button>
              <button
                className="hidden md:block btn btn-primary text-white"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="px-6 md:flex">
            <div className="mb-4">
              <h1 className="text-xl sm:text-xl text-center font-semibold text-primary">
                {recipe.caption}
              </h1>
              <div className="mb-4">
                {recipe.photos && recipe.photos.length > 0 && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                        {/* Wrap the div in an onClick event handler */}
                        <div onClick={handleOpenInNewTab}>
                          {/* Background image */}
                          <img
                            src={recipe.photos[slideshowIndex]}
                            alt={`Recipe-Photos ${slideshowIndex + 1}`}
                            className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                          />
                          {/* Image */}
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
                <div className="mb-4 ">
                  <h2 className="text-xl text-center sm:text-2xl font-semibold mb-2 text-primary">
                    Ingredients:
                  </h2>
                  <div className="w-full flex justify-center">
                    <ul className=" lg:grid lg:grid-cols-2 gap-x-6 lg:gap-x-10 list-disc text-xs  ">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="mb-1">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {hasInstructions && (
                <div className="mb-4">
                  <h2 className="text-xl text-center sm:text-2xl font-semibold mb-2 text-primary">
                    Instructions:
                  </h2>
                  <div className="w-full flex justify-center">
                    <ol className="list-decimal max-w-sm lg:max-w-2xl  text-xs   ">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="mb-1">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
