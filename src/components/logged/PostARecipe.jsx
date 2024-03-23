import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../authContext";
import { firestore } from "../../firebase";
import { Link } from "react-router-dom";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import uploadload from "../../assets/loading.gif";
import check from "../../assets/check.gif";

const Modal = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="h-screen bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="md:text-2xl text-xl font-semibold my-2">
          Thank you for submitting your recipe, it will now display on Recipe
          pages!
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

const PostARecipe = () => {
  const auth = useAuth();
  const user = auth.currentUser;
  const userUid = user ? user.uid : "unknown";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedTimestamp = now.toLocaleDateString("en-US", options);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const registeredDoc = doc(firestore, "registered", userUid);
        const docSnapshot = await getDoc(registeredDoc);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setProfilePhotoUrl(userData.profilePhotoUrl);
        }
      } catch (error) {
        console.error("Error retrieving user information: ", error);
      }
    };
    getUserInfo();
  }, [userUid]);

  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoRequired, setIsPhotoRequired] = useState(false);
  const [errors, setErrors] = useState({
    recipeName: "",
    ingredients: [],
    instructions: [],
    photos: "",
  });

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

    if (selectedPhotos.length === 0) {
      setIsPhotoRequired(true);
      return;
    }

    setIsPhotoRequired(false);

    for (const photo of selectedPhotos) {
      uploadPhoto(photo);
    }
  };

  const generateRandomName = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 10; // Adjust the length of the random string as needed
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const uploadPhoto = async (photo) => {
    try {
      const storage = getStorage();
      const randomName = generateRandomName();
      const fileExtension = photo.name.split(".").pop();
      const storageRef = ref(
        storage,
        `recipe_photos/${userUid}/${randomName}.${fileExtension}`
      );

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

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      recipeName: "",
      ingredients: [],
      instructions: [],
      photos: "",
    };

    if (!recipeName) {
      valid = false;
      newErrors.recipeName = "Recipe name is required.";
    }

    if (
      ingredients.length === 0 ||
      ingredients.every((ingredient) => !ingredient)
    ) {
      valid = false;
      newErrors.ingredients.push("At least one ingredient is required.");
    }

    if (
      instructions.length === 0 ||
      instructions.every((instruction) => !instruction)
    ) {
      valid = false;
      newErrors.instructions.push("At least one instruction is required.");
    }

    if (photos.length === 0) {
      valid = false;
      newErrors.photos = "A photo is required.";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const recipeData = {
      recipeId: generateRecipeId(),
      caption: recipeName,
      ingredients,
      instructions,
      photos,
      userUid,
      profilePhotoUrl, // Include user profile photo URL
      firstName, // Include user first name
      lastName, // Include user last name
      timestamp: formattedTimestamp,
    };

    const recipesRef = collection(firestore, "recipes");

    try {
      setIsSubmitting(true);
      await addDoc(recipesRef, recipeData); // Use addDoc to add a new recipe document
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding recipe: ", error);
    }
  };

  const generateRecipeId = () => {
    const previousRecipeId = localStorage.getItem("recipeId") || "0000000000";
    const newRecipeId = String(parseInt(previousRecipeId) + 1).padStart(
      10,
      "0"
    );
    localStorage.setItem("recipeId", newRecipeId);
    return newRecipeId;
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        {errors.recipeName && (
          <p className="text-red-600">{errors.recipeName}</p>
        )}

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
                {isPhotoRequired && <p className="hidden"></p>}
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
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
          />
          {errors.photos && <p className="text-red-600">{errors.photos}</p>}
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-primary">Ingredients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2">
              <h1 className="font-bold">{index + 1}.) </h1>
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
                  className="btn btn-sm px-2 ml-1 btn-error text-white"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.ingredients.length > 0 && (
            <p className="text-red-600">{errors.ingredients[0]}</p>
          )}
          <button
            type="button"
            onClick={addIngredient}
            className="btn btn-primary btn-xs text-white"
          >
            Add Ingredient
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-primary">Instructions</h3>
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-center mb-2">
              <h1 className="font-bold">{index + 1}.) </h1>
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
                  className="btn btn-sm px-2 ml-1 btn-error text-white"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {errors.instructions.length > 0 && (
            <p className="text-red-600">{errors.instructions[0]}</p>
          )}
          <button
            type="button"
            onClick={addInstruction}
            className="btn btn-primary btn-xs text-white"
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
            {isSubmitting ? "Submitting..." : "Submit Recipe"}
          </button>
        </div>
      </form>
      <Modal show={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default PostARecipe;
