import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLogout } from "react-icons/ai";
import { getAuth, signOut } from "firebase/auth";

import Swal from "sweetalert2";
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const productsCollection = collection(firestore, "products");
    const productsQuery = query(
      productsCollection,
      orderBy("productId", "desc")
    );

    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          productId: data.productId,
          userUid: data.userUid,
          caption: data.caption,
          address: data.address,
          description: data.description,
          timestamp: data.timestamp,
          photos: data.photos,
          price: data.price, // Added price field
          firstName: data.firstName,
          lastName: data.lastName,
          isHidden: data.isHidden || false, // Initialize isHidden property
          // Add more fields if needed
        });
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const registeredCollection = collection(firestore, "registered");
    const unregister = onSnapshot(registeredCollection, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Add more fields if needed
        });
      });
      setUsers(usersData);
    });

    return () => {
      unregister();
    };
  }, []);

  const toggleProductVisibility = async (productId, isHidden) => {
    try {
      if (isHidden) {
        // Product is hidden, show confirm dialog to show it
        const confirmationResult = await Swal.fire({
          title: "Show Product",
          text: "Are you sure you want to show this product?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        });

        if (confirmationResult.isConfirmed) {
          const productDocRef = doc(firestore, "products", productId);
          await updateDoc(productDocRef, {
            isHidden: false,
            hideReason: null, // Clear the hide reason when showing the product
          });
          // Update local state to reflect the change
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === productId
                ? { ...product, isHidden: false, hideReason: null }
                : product
            )
          );
          Swal.fire("Success!", `Product has been shown.`, "success");
        }
        return;
      }

      // Product is visible, show input options to hide it
      const { value: reason } = await Swal.fire({
        title: "Hide Product",
        input: "select",
        inputLabel: "Select a reason",
        inputOptions: {
          "Inappropriate Content": "Inappropriate Content",
          "Spam or Scams": "Spam or Scams",
          "Copyright Infringement": "Copyright Infringement",
          "False Information": "False Information",
          "Violations of Website Policies": "Violations of Website Policies",
          "Privacy Concerns": "Privacy Concerns",
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonText: "Hide",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          return !value && "You need to select a reason!";
        },
      });

      if (reason) {
        const productDocRef = doc(firestore, "products", productId);
        await updateDoc(productDocRef, {
          isHidden: true,
          hideReason: reason, // Store the hide reason in Firestore
        });
        // Update local state to reflect the change
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? { ...product, isHidden: true, hideReason: reason }
              : product
          )
        );
        Swal.fire("Success!", `Product has been hidden.`, "success");
      }
    } catch (error) {
      console.error("Error updating product visibility:", error);
      Swal.fire(
        "Error!",
        "An error occurred while updating product visibility.",
        "error"
      );
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    return (
      product.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.price.toString().includes(searchQuery.toLowerCase()) || // Added price field to search
      (users.find((user) => user.id === product.userUid) &&
        `${users.find((user) => user.id === product.userUid).firstName} ${
          users.find((user) => user.id === product.userUid).lastName
        }`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
    );
  });

  const navigate = useNavigate();

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const openModal = (productId) => {
    const modal = document.getElementById(`view_product_${productId}`);
    modal.showModal();
  };

  const closeModal = (productId) => {
    const modal = document.getElementById(`view_product_${productId}`);
    modal.close();
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
              users="bg-white text-primary "
              locations="bg-white text-primary"
              products="bg-primary text-white"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
              deletions="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
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
                  <li className="bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <GiMussel size={25} className="text-white" />
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
                <Link to="/admin/reports">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineReport size={25} />
                    Reports
                  </li>
                </Link>
                <Link to="/admin/delete/user">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <RiDeleteBin6Line size={25} />
                    Deletion Requests
                  </li>
                </Link>
                <li
                  onClick={handleLogoutConfirmation}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
              </ul>
            </div>
            {/* Product Management Table */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                Product Management
              </h1>
              <div className="py-5">
                <input
                  type="text"
                  placeholder="Search for Caption/Price/Name..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <h1 className="text-center pb-2 text-primary underline text-xs lg:hidden">
                  Swipe left & right to view other data
                </h1>
              </div>

              <div className="overflow-y-auto max-h-[450px]">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No products found for "{searchQuery}". Please try a
                    different search.
                  </p>
                ) : (
                  <table className="mx-auto table table-xs border-collapse">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-4 py-2 text-xs text-center">
                          Caption
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Photo
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Price
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Name
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="border border-gray-300 bg-gray-200 px-4 py-2 text-center text-xs">
                            {product.caption}
                          </td>
                          <td className="border border-gray-300 bg-gray-200  px-4 py-2 text-center text-xs">
                            {product.photos && product.photos.length > 0 ? (
                              <img
                                src={product.photos[0]}
                                alt={product.caption}
                                className="h-12 w-12 mx-auto object-cover rounded-md"
                              />
                            ) : (
                              <span>No photo available</span>
                            )}
                          </td>
                          <td className="border border-gray-300 bg-gray-200  px-4 py-2 text-center text-xs">
                            ₱{product.price}.00
                          </td>
                          <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                            {users.find((user) => user.id === product.userUid)
                              ? `${
                                  users.find(
                                    (user) => user.id === product.userUid
                                  ).firstName
                                } ${
                                  users.find(
                                    (user) => user.id === product.userUid
                                  ).lastName
                                }`
                              : "User Not Found"}
                          </td>

                          <td className="border flex flex-col gap-2 border-gray-300 bg-gray-200  px-4 py-2 text-center">
                            <button
                              className={`block w-full font-normal btn-sm btn ${
                                product.isHidden ? "btn-success" : "btn-error"
                              } text-white mt-2`}
                              onClick={() =>
                                toggleProductVisibility(
                                  product.id,
                                  product.isHidden
                                )
                              }
                            >
                              {product.isHidden ? "Show" : "Hide"}
                            </button>

                            <button
                              className="btn btn-primary btn-sm w-full"
                              onClick={() => openModal(product.id)}
                            >
                              Other Details
                            </button>
                            <dialog
                              id={`view_product_${product.id}`}
                              className="modal"
                            >
                              <div className="modal-box">
                                <form method="dialog">
                                  {/* if there is a button in form, it will close the modal */}
                                  <button
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                    onClick={() => closeModal(product.id)}
                                  >
                                    ✕
                                  </button>
                                </form>
                                <h3 className="font-bold text-lg">
                                  {product.caption}
                                </h3>
                                <div className="text-start">
                                  <p className="">
                                    <span className="font-bold">
                                      Posted by:
                                    </span>{" "}
                                    {product.firstName} {product.lastName}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">Address:</span>{" "}
                                    {product.address}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">
                                      Description:
                                    </span>{" "}
                                    {product.description}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">Date:</span>{" "}
                                    {product.timestamp}
                                  </p>
                                  <p className="">
                                    <span className="font-bold">Price:</span> ₱
                                    {product.price}.00
                                  </p>
                                  <p className="">
                                    <span className="font-bold">
                                      Other Information:
                                    </span>{" "}
                                    {product.otherInformation ||
                                      "No other information provided"}
                                  </p>
                                </div>
                                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 xl:grid-cols-3">
                                  {/* Display photos */}
                                  {product.photos &&
                                    product.photos.map((photo, index) => (
                                      <img
                                        key={index}
                                        src={photo}
                                        alt={`Products ${index + 1}`}
                                        className="h-40 w-full object-cover rounded-md"
                                      />
                                    ))}
                                </div>
                              </div>
                            </dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
