import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";
import LogoutModal from "../authentication/LogoutModal";

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState({});
  const [registeredUsers, setRegisteredUsers] = useState({});
  const [recipes, setRecipes] = useState({});
  const [reportType, setReportType] = useState("product"); // Default to product reports
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch reports data based on the selected report type
    const fetchReports = async () => {
      const db = getFirestore();
      const reportsRef = collection(
        db,
        reportType === "profile"
          ? "profileReports"
          : reportType === "product"
          ? "productReports"
          : "recipeReports"
      );
      const querySnapshot = await getDocs(reportsRef);
      const reportsData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include the document ID in each report object
        ...doc.data(),
      }));
      setReports(reportsData);
      setLoading(false);
    };
    // Fetch products and registered users data
    const fetchAdditionalData = async () => {
      const db = getFirestore();

      // Fetch products data
      const productsRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsRef);
      const productsData = {};
      productsSnapshot.forEach((doc) => {
        productsData[doc.id] = doc.data();
      });
      setProducts(productsData);

      // Fetch registered users data
      const registeredRef = collection(db, "registered");
      const registeredSnapshot = await getDocs(registeredRef);
      const registeredData = {};
      registeredSnapshot.forEach((doc) => {
        registeredData[doc.id] = doc.data();
      });
      setRegisteredUsers(registeredData);

      // Fetch recipes data
      const recipesRef = collection(db, "recipes");
      const recipesSnapshot = await getDocs(recipesRef);
      const recipesData = {};
      recipesSnapshot.forEach((doc) => {
        recipesData[doc.id] = doc.data();
      });
      setRecipes(recipesData);
    };

    fetchReports();
    fetchAdditionalData();
  }, [reportType]);

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
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
        <div className="h-screen md:pt-0 pt-24 w-full">
          <div className="md:hidden">
            <NavbarAdmin
              users="bg-white text-primary"
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-primary text-white "
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-28 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-2xl lg:text-3xl">
                  Admin Panel
                </h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-6">
                <Link to="/admin/users">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaUsers size={25} />
                    Users
                  </li>
                </Link>
                <Link to="/admin/locations">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <LiaSearchLocationSolid size={25} className="" />
                    Locations
                  </li>
                </Link>
                <Link to="/admin/products">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <GiMussel size={25} />
                    Products
                  </li>
                </Link>
                <Link to="/admin/recipes">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineRestaurantMenu size={25} />
                    Recipes
                  </li>
                </Link>
                <Link to="/admin/appeal">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaFile size={25} />
                    Appeal
                  </li>
                </Link>
                <li className="bg-primary cursor-pointer p-4 text-white text-xs flex gap-2 items-center">
                  <MdOutlineReport size={25} />
                  Reports
                </li>
                <li
                  onClick={toggleLogoutModal}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>
            {/* Reports List */}
            <div className="container z-40 lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <div className="flex justify-center md:justify-end items-center gap-2 pt-1 mb-4">
                <h1 className="text-xs">Type of Reports</h1>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md bg-base-100 text-sm focus:outline-none focus:border-blue-500"
                  value={reportType}
                  onChange={handleReportTypeChange}
                >
                  <option value="product">Product Reports</option>
                  <option value="recipe">Recipe Reports</option>
                  <option value="profile">Profile Reports</option>
                </select>
              </div>
              <h1 className="text-center text-2xl font-bold">
                {reportType === "product"
                  ? "Product"
                  : reportType === "recipe"
                  ? "Recipe"
                  : "Profile"}{" "}
                Reports
              </h1>
              <ul className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report, index) => (
                  <li className="glass w-full p-5" key={index}>
                    {registeredUsers[report.userId] && (
                      <div className="flex items-center gap-2">
                        '
                        <div>
                          <img
                            className="md:w-14 md:h-14  w-10 h-10 border border-primary rounded-full object-cover"
                            src={registeredUsers[report.userId].profilePhotoUrl}
                            alt={`${registeredUsers[report.userId].firstName} ${
                              registeredUsers[report.userId].lastName
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <p>
                            {registeredUsers[report.userId].firstName}{" "}
                            {registeredUsers[report.userId].lastName}
                          </p>
                          <p className="italic text-error text-xs font-bold">
                            The reported user
                          </p>
                        </div>
                      </div>
                    )}
                    {reportType === "profile" && (
                      <div className="flex flex-col gap-2">
                        <div className="py-1 flex justify-end">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() =>
                              document
                                .getElementById(`profile-${report.id}`)
                                .showModal()
                            }
                          >
                            View Proof of Report
                          </button>
                          <dialog id={`profile-${report.id}`} className="modal">
                            <div className="modal-box">
                              <h3 className="font-bold text-center text-lg">
                                Proof of Report
                              </h3>
                              <img
                                className="w-full object-contain rounded-md"
                                src={report.photoUrl}
                                alt={`${
                                  registeredUsers[report.userId].firstName
                                } ${
                                  registeredUsers[report.userId].lastName
                                }'s proof of report`}
                              />
                            </div>
                            <form method="dialog" className="modal-backdrop">
                              <button>close</button>
                            </form>
                          </dialog>
                        </div>
                      </div>
                    )}

                    {reportType !== "profile" && (
                      <div className="py-1 flex justify-end">
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => {
                            const modalId =
                              reportType === "product"
                                ? `productModal-${report.productId}`
                                : reportType === "recipe"
                                ? `recipeModal-${report.recipeId}`
                                : "";

                            document.getElementById(modalId).showModal();
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                    {reportType === "product" && products[report.productId] && (
                      <div>
                        <p>
                          <span className="font-bold "> Product Name:</span>{" "}
                          {products[report.productId].caption}
                        </p>
                      </div>
                    )}
                    {reportType === "recipe" && (
                      <div>
                        <p>
                          <span className="font-bold ">Recipe ID: </span>
                          {report.recipeId}
                        </p>
                      </div>
                    )}

                    <p>
                      <span className="font-bold ">Reason: </span>
                      {report.reason}
                    </p>
                    <p>
                      <span className="font-bold ">Explanation: </span>{" "}
                      {report.explanation}
                    </p>
                    {/* Conditionally render View Details button */}
                    <dialog
                      id={`productModal-${report.productId}`}
                      className="modal"
                    >
                      <div className="modal-box">
                        <h3 className="font-bold text-center text-lg">
                          Product Details
                        </h3>
                        {reportType === "product" &&
                          products[report.productId] && (
                            <div className="text-center">
                              <p className="font-bold text-center italic">
                                {products[report.productId].caption}
                              </p>
                              <div className="py-2 text-left">
                                <p>
                                  <span className="font-bold">
                                    Description{" "}
                                  </span>
                                  : {products[report.productId].description}
                                </p>
                                {/* Display Address */}
                                <p>
                                  <span className="font-bold">Address </span>:{" "}
                                  {products[report.productId].address}
                                </p>
                                {/* Display Other Information */}
                                <p>
                                  <span className="font-bold">
                                    Other Information{" "}
                                  </span>
                                  :{" "}
                                  {products[report.productId].otherInformation}
                                </p>
                              </div>
                              <div className="py-2">
                                <h1 className="font-bold text-lg">Photos</h1>
                              </div>
                              <div className="flex flex-col gap-2 justify-center items-center">
                                {/* Display Photos */}
                                {products[report.productId].photos.map(
                                  (photo, index) => (
                                    <img
                                      key={index}
                                      src={photo}
                                      alt={`${
                                        products[report.productId].name
                                      } - Photos ${index + 1}`}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                    <dialog
                      id={`recipeModal-${report.recipeId}`}
                      className="modal"
                    >
                      <div className="modal-box">
                        <h3 className="font-bold text-center text-lg">
                          Recipe Details
                        </h3>
                        {reportType === "recipe" &&
                          recipes[report.recipeId] && (
                            <div className="text-center">
                              <p className="font-bold italic">
                                {recipes[report.recipeId].caption}
                              </p>
                              {/* Display Ingredients */}
                              <div className="text-left py-2">
                                <h4 className="font-bold">Ingredients:</h4>
                                <ul className="list-disc pl-5">
                                  {recipes[report.recipeId].ingredients.map(
                                    (ingredient, index) => (
                                      <li key={index}>{ingredient}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                              {/* Display Instructions */}
                              <div className="text-left">
                                <h4 className="font-bold">Instructions:</h4>
                                <ol className="list-decimal pl-5">
                                  {recipes[report.recipeId].instructions.map(
                                    (instruction, index) => (
                                      <li key={index}>{instruction}</li>
                                    )
                                  )}
                                </ol>
                              </div>
                              <div className="py-2">
                                <h1 className="font-bold text-lg">Photos</h1>
                              </div>
                              <div className="flex flex-col gap-2 justify-center items-center">
                                {/* Display Photos */}
                                {recipes[report.recipeId].photos.map(
                                  (photo, index) => (
                                    <img
                                      key={index}
                                      src={photo}
                                      alt={`${
                                        recipes[report.recipeId].name
                                      } - Photos ${index + 1}`}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default AdminReports;
