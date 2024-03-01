import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const handleOptionsClick = (productId, product) => {
    setSelectedProductId(selectedProductId === productId ? null : productId);
    setSelectedProduct(selectedProduct === productId ? null : product);
  };

  const closeOptions = () => {
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  const deleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      // Implement delete product logic here
      console.log("Delete product with ID:", productId);
    }
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
                  placeholder="Search..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="overflow-auto">
                <table className="mx-auto">
                  <thead>
                    <tr>
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
                        <td className="border px-4 py-2 text-center text-xs">
                          {product.caption}
                        </td>
                        <td className="border px-4 py-2 text-center text-xs">
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
                        <td className="border px-4 py-2 text-center text-xs">
                          ₱{product.price}.00
                        </td>
                        <td className="border px-4 py-2 text-center text-xs">
                          {product.firstName} {product.lastName}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <div className="relative inline-block">
                            <BsThreeDotsVertical
                              size={20}
                              className="text-primary cursor-pointer"
                              onClick={() =>
                                handleOptionsClick(product.productId, product)
                              }
                            />
                            {selectedProductId === product.productId && (
                              <div className="absolute top-[-40px] right-[-20px] z-10 bg-white p-2 shadow-md rounded-md mt-2">
                                <button
                                  className="block w-full py-2 px-1 text-center bg-red-500 text-white rounded-md text-xs hover:bg-red-900 border border-gray-200 mt-2"
                                  onClick={() =>
                                    deleteProduct(product.productId)
                                  }
                                >
                                  Delete
                                </button>
                                <button
                                  className="block w-full py-2 px-1 text-center rounded-md text-xs hover:bg-gray-200 border border-gray-200 mt-2"
                                  onClick={closeOptions}
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
