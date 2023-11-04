import React, { useState, useRef } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../authContext";
import { firestore } from "../../firebase";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import uploadload from "../../assets/loading.gif";

const PostARecipe = () => {
  const auth = useAuth();
  const user = auth.currentUser;
  const userUid = user ? user.uid : "unknown";

  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const fileInputRef = useRef(null);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    const updatedInstructions = [...instructions];
    updatedInstructions.splice(index, 1);
    setInstructions(updatedInstructions);
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current.click();
  };

  const handleFilesSelected = (e) => {
    const selectedPhotos = e.target.files;

    for (const photo of selectedPhotos) {
      uploadPhoto(photo);
    }
  };

  const uploadPhoto = async (photo) => {
    try {
      const storage = getStorage();
      const userUid = user ? user.uid : "unknown";

      const storageRef = ref(storage, `recipe_photos/${userUid}/${photo.name}`);

      // Set the loading image as the initial preview
      setPhotoPreviews((prevPreviews) => [...prevPreviews, uploadload]);

      await uploadBytes(storageRef, photo);
      const downloadURL = await getDownloadURL(storageRef);

      // Replace the loading image with the uploaded photo when it's done
      setPhotos((prevPhotos) => [...prevPhotos, downloadURL]);
      setPhotoPreviews((prevPreviews) => [
        ...prevPreviews.slice(0, prevPreviews.length - 1),
        URL.createObjectURL(photo),
      ]);
    } catch (error) {
      console.error("Error uploading photo: ", error);
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    const updatedPreviews = [...photoPreviews];

    updatedPhotos.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);

    deletePhotoFromStorage(index);
  };

  const deletePhotoFromStorage = async (index) => {
    const photoURL = photos[index];

    const storageRef = ref(getStorage(), photoURL);

    try {
      await deleteObject(storageRef);
      console.log("Photo deleted from Storage: ", photoURL);
    } catch (error) {
      console.error("Error deleting photo from Storage: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeData = {
      name: recipeName,
      ingredients,
      instructions,
      photos,
      userUid,
      timestamp: new Date().toString(),
    };

    const recipesRef = collection(firestore, "recipes");
    const userRecipeDocRef = doc(recipesRef, userUid);

    try {
      await setDoc(userRecipeDocRef, recipeData);
      console.log("Recipe added for user with ID: ", userUid);
    } catch (error) {
      console.error("Error adding recipe: ", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-2xl font-bold text-primary pt-24 mb-4">
        Post a Recipe
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full border rounded p-2 mb-4"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />

        <div className="mb-4">
          <h3 className="text-lg text-primary">Photo Upload</h3>
          <div className="flex flex-wrap gap-2">
            {photoPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative w-20 h-20 justify-center items-center"
              >
                {preview === uploadload ? (
                  <img
                    src={preview}
                    alt="Uploading..."
                    className="w-10 h-10 pt-6 m-auto flex justify-center items-center object-contain rounded"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 text-red-500 text-lg hover:text-red-600 focus:outline-none cursor-pointer"
                >
                  <RiCloseLine />
                </button>
              </div>
            ))}
            <div
              className="w-20 h-20 border rounded flex items-center justify-center cursor-pointer"
              onClick={handlePhotoUpload}
            >
              <RiAddLine size={32} color="#6B7280" />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-primary">Ingredients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder={`Ingredient #${index + 1}`}
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-primary ml-2 hover:text-primary-dark cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-primary hover:text-primary-dark cursor-pointer"
          >
            Add Ingredient
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-primary">Instructions</h3>
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="w-full border rounded p-2"
                placeholder={`Instruction #${index + 1}`}
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="text-primary ml-2 hover:text-primary-dark cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="text-primary hover:text-primary-dark cursor-pointer"
          >
            Add Instruction
          </button>
        </div>

        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark focus:outline-none cursor-pointer"
        >
          Submit Recipe
        </button>
      </form>
    </div>
  );
};

export default PostARecipe;
