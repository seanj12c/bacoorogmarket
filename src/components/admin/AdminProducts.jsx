import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineLogout } from "react-icons/ai";
import { getAuth, signOut } from "firebase/auth";
import LogoutModal from "../authentication/LogoutModal";
import Swal from "sweetalert2";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          caption: data.caption,
          photos: data.photos,
          price: data.price, // Added price field
          firstName: data.firstName,
          lastName: data.lastName,
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

  const deleteProduct = async (docId, productCaption) => {
    Swal.fire({
      title: `Are you sure you want to delete "${productCaption}" from the product database?`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const db = firestore;
          const productDocRef = doc(db, "products", docId);
          await deleteDoc(productDocRef);
          Swal.fire("Deleted!", "Your product has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire(
            "Error!",
            "An error occurred while deleting the product.",
            "error"
          );
        }
      }
    });
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    return (
      product.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.price.toString().includes(searchQuery.toLowerCase()) || // Added price field to search
      (product.firstName + " " + product.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const navigate = useNavigate();

  const toggleLogoutModal = () => {
    setShowLogoutModal(!showLogoutModal);
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
                <li
                  onClick={toggleLogoutModal}
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
                                className="h-12 w-12 object-cover rounded-md"
                              />
                            ) : (
                              <span>No photo available</span>
                            )}
                          </td>
                          <td className="border border-gray-300 bg-gray-200  px-4 py-2 text-center text-xs">
                            ₱{product.price}.00
                          </td>
                          <td className="border border-gray-300 bg-gray-200  px-4 py-2 text-center text-xs">
                            {product.firstName} {product.lastName}
                          </td>
                          <td className="border border-gray-300 bg-gray-200  px-4 py-2 text-center">
                            <button
                              className="block w-full font-normal btn-sm btn btn-error text-white mt-2"
                              onClick={() =>
                                deleteProduct(product.id, product.caption)
                              }
                            >
                              Delete
                            </button>
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
      {showLogoutModal && (
        <LogoutModal
          handleLogout={handleLogout}
          closeModal={toggleLogoutModal}
        />
      )}
    </div>
  );
};

export default AdminProducts;
