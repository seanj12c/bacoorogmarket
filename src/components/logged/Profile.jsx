import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { Link, useParams } from "react-router-dom";
import uploadload from "../../assets/loading.gif";
import ProductModal from "./ProductModal";
import RecipeModal from "./RecipeModal";
import { MdOutlineAttachEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";

import { CiLocationArrow1 } from "react-icons/ci";
const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedRecipe(null);
  };

  useEffect(() => {
    const registeredCollection = collection(firestore, "registered");
    const userQuery = query(
      registeredCollection,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(userQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setUser({
          id: doc.id,
          profilePhotoUrl: data.profilePhotoUrl,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          contact: data.contact,
          address: data.address,
          userId: data.userId,
        });
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    if (!user) return; // Exit if user is not loaded yet

    const fetchUserPosts = async () => {
      try {
        const productsCollection = collection(firestore, "products");
        const recipesCollection = collection(firestore, "recipes");

        const userProductsQuery = query(
          productsCollection,
          where("userUid", "==", user.userId)
        );
        const userProductsSnapshot = await getDocs(userProductsQuery);
        const userProductsData = userProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "product",
          ...doc.data(),
        }));

        const userRecipesQuery = query(
          recipesCollection,
          where("userUid", "==", user.userId)
        );
        const userRecipesSnapshot = await getDocs(userRecipesQuery);
        const userRecipesData = userRecipesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "recipe",
          ...doc.data(),
        }));

        const allUserPosts = [...userProductsData, ...userRecipesData];
        setUserPosts(allUserPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, [user]);

  const toggleDisplay = (isProducts) => {
    setDisplayProducts(isProducts);
  };

  return (
    <div className="md:max-w-full max-w-xl mx-auto md:p-0 p-4">
      {loading ? (
        <div className="h-screen pt-0 w-full grid items-center">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto flex justify-center items-center"
            src={uploadload}
            alt=""
          />
        </div>
      ) : user ? (
        <div className="h-full pt-24 w-full ">
          <div className="md:flex ">
            <div className="md:fixed md:w-1/3 md:px-5">
              <div className="bg-bgray md:px-5 mt-2 w-full py-4 px-2 rounded-lg">
                <div className="">
                  <h2 className="text-2xl md:text-base lg:text-xl text-center font-bold">
                    Viewing Profile
                  </h2>
                </div>
                <div className="w-full">
                  <div className="mb-2 w-full">
                    <img
                      src={user.profilePhotoUrl}
                      alt="Profile"
                      className="object-cover w-48 h-48 lg:w-36 lg:h-36 md:w-28 md:h-28 mx-auto"
                      style={{
                        border: "2px solid #008080",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </div>
                <p className="text-center text-2xl lg:text-2xl md:text-base mx-auto">
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </p>
                <a
                  href={`mailto:${user.email}`}
                  className="text-xs flex items-center hover:text-primary hover:translate-x-1 transition-all ease-in-out duration-300 py-1  gap-2"
                >
                  <MdOutlineAttachEmail size={15} /> {user.email}
                </a>
                <p className="text-xs flex items-center hover:text-primary  hover:translate-x-1 transition-all ease-in-out duration-300 py-1 gap-2">
                  <CiLocationArrow1 size={15} /> {user.address}
                </p>
                <a
                  href={`tel:${user.contact}`}
                  className="text-xs flex items-center hover:text-primary py-1 hover:translate-x-1 transition-all ease-in-out duration-300 gap-2"
                >
                  <FaPhone size={15} /> {user.contact}
                </a>
              </div>
              <div className="bg-bgray mt-2 w-full rounded-lg px-2 py-2">
                <h1 className="text-lg text-center w-full font-bold pb-2">
                  Want to talk to {user.firstName}?
                </h1>

                <div className="flex justify-center">
                  <button className="btn-sm md:btn-xs lg:btn-sm btn btn-primary">
                    <Link to="/chat">Go to Chats</Link>
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 md:px-5 md:ml-auto">
              <div className="md:fixed md:flex justify-center bg-bgray md:bg-transparent md:w-2/3 md:px-5 mx-auto py-2 rounded-lg my-2">
                <div className="md:glass md:w-full md:max-w-3xl md:h-20 rounded-lg p-2">
                  <h1 className="text-center font-bold text-black mb-2">
                    {user.firstName}'s posts here
                  </h1>
                  <div className="flex text-xs items-center justify-center">
                    <button
                      onClick={() => toggleDisplay(true)}
                      className={`mx-2 px-4 py-2 ${
                        displayProducts
                          ? "bg-primary text-white"
                          : "bg-gray-400 text-black"
                      } rounded-md`}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => toggleDisplay(false)}
                      className={`mx-2 px-4 py-2 ${
                        displayProducts
                          ? "bg-gray-400 text-black"
                          : "bg-primary text-white"
                      } rounded-md`}
                    >
                      Recipes
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:pt-24">
                {displayProducts
                  ? userPosts
                      .filter((post) => post.type === "product")
                      .sort((a, b) => b.productId - a.productId)
                      .map((product, index) => (
                        <div
                          onClick={() => handleProductClick(product)}
                          key={index}
                          className="bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer"
                        >
                          <div className="flex gap-2 py-2 items-center w-full justify-between">
                            <div className="flex gap-2 items-center w-full justify-between px-2">
                              <div className="flex gap-4 items-center">
                                <img
                                  src={user.profilePhotoUrl}
                                  alt="Profile"
                                  className="w-12 h-12 rounded-full object-cover inline-block"
                                />
                                <div>
                                  <p className="text-primary text-sm font-semibold">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {product.timestamp}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h1 className="text-lg font-semibold mb-2">
                              {product.caption}
                            </h1>
                          </div>
                          <div
                            className={
                              product.photos && product.photos.length > 1
                                ? "grid gap-2 grid-cols-2"
                                : ""
                            }
                          >
                            {product.photos &&
                              product.photos
                                .slice(0, 4)
                                .map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    className="w-full h-40 md:h-72 object-cover rounded-lg mb-2"
                                    src={photo}
                                    alt=""
                                  />
                                ))}
                          </div>
                        </div>
                      ))
                  : userPosts
                      .filter((post) => post.type === "recipe")
                      .sort((a, b) => b.recipeId - a.recipeId)
                      .map((recipe, index) => (
                        <div
                          onClick={() => handleRecipeClick(recipe)}
                          key={index}
                          className="bg-bgray rounded-lg mt-2 shadow p-4 cursor-pointer"
                        >
                          <div className="flex gap-2 py-2 items-center w-full justify-between">
                            <div className="flex gap-2 items-center w-full justify-between px-2">
                              <div className="flex gap-4 items-center">
                                <img
                                  src={user.profilePhotoUrl}
                                  alt="Profile"
                                  className="w-12 h-12 rounded-full object-cover inline-block"
                                />
                                <div>
                                  <p className="text-primary text-sm font-semibold">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {recipe.timestamp}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h1 className="text-lg font-semibold mb-2">
                              {recipe.caption}
                            </h1>
                          </div>
                          <div
                            className={
                              recipe.photos && recipe.photos.length > 1
                                ? "grid gap-2 grid-cols-2"
                                : ""
                            }
                          >
                            {recipe.photos &&
                              recipe.photos
                                .slice(0, 4)
                                .map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    className="w-full h-40 md:h-72 object-cover rounded-lg mb-2"
                                    src={photo}
                                    alt=""
                                  />
                                ))}
                          </div>
                        </div>
                      ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
      {selectedProduct && (
        <ProductModal product={selectedProduct} closeModal={closeModal} />
      )}

      {/* Render Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} closeModal={closeModal} />
      )}
    </div>
  );
};

export default Profile;
