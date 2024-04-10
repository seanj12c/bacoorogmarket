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
import { useNavigate } from "react-router-dom";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import uploadload from "../../assets/loading.gif";

import { IoReturnDownBackOutline } from "react-icons/io5";
import Swal from "sweetalert2";

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
      setIsSubmitting(false);
      // Show SweetAlert for success
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Thank you for submitting your recipe, it will now display on Recipe pages!",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/recipe");
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error adding recipe: ", error);
      // Show SweetAlert for error
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again later.",
        confirmButtonColor: "#008080",
      });
    }
  };

  const generateRecipeId = () => {
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(7); // Generate random string
    return `${timestamp}_${randomString}`; // Combine timestamp and random string
  };

  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // This will navigate back in the history stack
  };

  return (
    <div className="p-4 sm:p-6 md:pb-0 pb-20 md:p-8 lg:p-10">
      <div className="pt-24 ">
        <button
          className="btn btn-xs md:btn-sm btn-error text-white btn-primary"
          onClick={goBack}
        >
          Go Back <IoReturnDownBackOutline className="md:hidden" size={15} />
          <IoReturnDownBackOutline className="hidden md:block" size={20} />
        </button>{" "}
        <h2 className="text-2xl text-center font-bold text-primary ">
          Post a Recipe
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg text-primary">Recipe Caption</h3>
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
          <h3 className="text-lg text-primary">Photo Upload </h3>
          <h6 className="text-xs italic text-red-600">
            Upload 1 photo at a time
          </h6>
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
    </div>
  );
};

export default PostARecipe;
