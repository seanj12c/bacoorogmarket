import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AdminInfo = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const db = getFirestore();
      const registeredRef = collection(db, "registered");
      const userQuery = query(registeredRef, where("userId", "==", userId));
      const userSnapshot = await getDocs(userQuery);
      userSnapshot.forEach((doc) => {
        setUserInfo(doc.data());
      });
    };

    const fetchUserProducts = async () => {
      const db = getFirestore();
      const productsRef = collection(db, "products");
      const productsQuery = query(productsRef, where("userUid", "==", userId));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = [];
      productsSnapshot.forEach((doc) => {
        productsData.push(doc.data());
      });
      setUserProducts(productsData);
    };

    const fetchUserRecipes = async () => {
      const db = getFirestore();
      const recipesRef = collection(db, "recipes");
      const recipesQuery = query(recipesRef, where("userUid", "==", userId));
      const recipesSnapshot = await getDocs(recipesQuery);
      const recipesData = [];
      recipesSnapshot.forEach((doc) => {
        recipesData.push(doc.data());
      });
      setUserRecipes(recipesData);
    };

    fetchUserInfo();
    fetchUserProducts();
    fetchUserRecipes();
  }, [userId]);

  const goBack = () => {
    navigate(-1);
  };

  const handleToggle = () => {
    setShowProducts((prev) => !prev);
  };

  const displayAllPhotos = (photos) => {
    const photoElements = photos
      .map(
        (photo, idx) =>
          `<img src="${photo}" alt="Image ${idx + 1}" class="w-full h-auto" />`
      )
      .join("");
    Swal.fire({
      html: photoElements,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        image: "custom-class-name",
        closeButton: "btn btn-error btn-circle text-white",
      },
    });
  };

  return (
    <div className="container mx-auto py-6 h-full flex flex-col justify-center">
      <div>
        <button
          className="btn btn-xs md:btn-sm btn-error text-white btn-primary ml-4 mb-4"
          onClick={goBack}
        >
          Go Back <IoReturnDownBackOutline className="md:hidden" size={15} />
          <IoReturnDownBackOutline className="hidden md:block" size={20} />
        </button>{" "}
      </div>
      {userInfo && (
        <div className="flex flex-col items-center">
          <div className="w-full px-2 flex items-center justify-center mb-4">
            <div>
              <img
                src={userInfo.profilePhotoUrl}
                alt="Profile"
                className="rounded-full mx-auto h-32 w-32 md:w-52 md:h-52 object-cover border border-full"
              />
              <h2 className="text-2xl text-center font-semibold mt-4">
                {userInfo.firstName} {userInfo.lastName}
              </h2>
              <p>
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p>
                <strong>Contact:</strong> {userInfo.contact}
              </p>
              <p>
                <strong>Address:</strong> {userInfo.address}
              </p>
              <p>
                <strong>Role:</strong> {userInfo.role}
              </p>
            </div>
          </div>
          <div className="w-full flex justify-center mb-4">
            {userInfo.role !== "Buyer" && (
              <button
                className={`btn btn-xs md:btn-sm  ${
                  showProducts ? "btn-primary" : ""
                } mr-2`}
                onClick={handleToggle}
              >
                Products
              </button>
            )}
            <button
              className={`btn btn-xs md:btn-sm  ${
                !showProducts ? "btn-primary" : ""
              }`}
              onClick={handleToggle}
            >
              Recipes
            </button>
          </div>

          <div className="w-full">
            {showProducts ? (
              <div className="p-4">
                <h2 className="text-2xl font-semibold mb-4">Products</h2>
                {userProducts.length === 0 ? (
                  <p className="text-center text-gray-500">
                    We couldn't find any products.
                  </p>
                ) : (
                  <>
                    <h1 className="text-xs italic text-primary">
                      Tap specific product to see all photos from that post in
                      full screen
                    </h1>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {userProducts.map((product, index) => (
                        <div
                          key={index}
                          className="border flex flex-col justify-around glass border-gray-300 p-4"
                          onClick={() => displayAllPhotos(product.photos)}
                        >
                          <div>
                            {" "}
                            <h3 className="text-lg font-semibold">
                              {product.caption}
                            </h3>
                            <p>{product.description}</p>
                            <div>
                              <img
                                src={product.photos[0]}
                                alt={`Product 1`}
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                          <div>
                            <p>
                              <strong>Address:</strong> {product.address}
                            </p>
                            <p>
                              <strong>Price:</strong> {product.price}
                            </p>
                            <p>
                              <strong>Timestamp:</strong> {product.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-2xl font-semibold mb-4">Recipes</h2>
                {userRecipes.length === 0 ? (
                  <p className="text-center text-gray-500">
                    We couldn't find any recipes.
                  </p>
                ) : (
                  <>
                    <h1 className="text-xs italic text-primary">
                      Tap specific recipes to see all photos from that post in
                      full screen
                    </h1>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {userRecipes.map((recipe, index) => (
                        <div
                          key={index}
                          className="border flex flex-col justify-around glass border-gray-300 p-4"
                          onClick={() => displayAllPhotos(recipe.photos)}
                        >
                          <div>
                            <h3 className="text-lg font-semibold">
                              {recipe.caption}
                            </h3>
                            <div>
                              <img
                                src={recipe.photos[0]}
                                alt={`Recipe 1`}
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                          <div>
                            <p>
                              <strong>Timestamp:</strong> {recipe.timestamp}
                            </p>
                            <div>
                              <strong>Ingredients:</strong>
                              <ul>
                                {recipe.ingredients.map((ingredient, idx) => (
                                  <li key={idx}>{ingredient}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong>Instructions:</strong>
                              <ul>
                                {recipe.instructions.map((instruction, idx) => (
                                  <li key={idx}>{instruction}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInfo;
