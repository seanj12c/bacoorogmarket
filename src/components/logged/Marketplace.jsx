import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore"; // Import orderBy here
import { firestore } from "../../firebase";

import uploadload from "../../assets/loading.gif";
import banner from "../../assets/banner.jpg";
import { FaSearch } from "react-icons/fa";
import { MdOutlinePostAdd, MdOutlineSort } from "react-icons/md";
import { Link } from "react-router-dom";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [freshnessFilter, setFreshnessFilter] = useState("None");
  const [productFilter, setProductFilter] = useState("None");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, "products"), orderBy("productId", "desc")),
      async (snapshot) => {
        const productsData = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const typeOfProduct = data.typeOfProduct || {}; // Ensure typeOfProduct exists

          // Fetch user details from "registered" collection
          const userDocRef = doc(firestore, "registered", data.userUid);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.data();

          // Check if the product is not hidden and not deactivated
          if (
            !data.isHidden &&
            !userData.isDeactivated &&
            (freshnessFilter === "None" ||
              typeOfProduct.freshness === freshnessFilter) &&
            (productFilter === "None" ||
              typeOfProduct.productName === productFilter) &&
            (userData.firstName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
              userData.lastName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              data.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
              data.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
          ) {
            productsData.push({
              id: docSnap.id,
              productId: data.productId,
              caption: data.caption,
              description: data.description,
              location: data.location,
              photos: data.photos,
              profilePhotoUrl: userData.profilePhotoUrl,
              price: data.price,
              firstName: userData.firstName,
              lastName: userData.lastName,
              timestamp: data.timestamp,
              address: data.address,
              otherInformation: data.otherInformation,
              userUid: data.userUid,
            });
          }
        }
        setProducts(productsData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [searchQuery, freshnessFilter, productFilter]);

  const capText = (text) => {
    return text.length > 35 ? text.substring(0, 35) + "..." : text;
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFreshnessFilter = (event) => {
    setFreshnessFilter(event.target.value);
  };

  const handleProductFilter = (event) => {
    setProductFilter(event.target.value);
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
        <div className="py-24">
          <div>
            <img
              src={banner}
              className="w-full h-20 md:h-32 lg:h-44 object-cover"
              alt=""
            />
          </div>
          <div className="flex py-2 w-full justify-center items-center gap-2 px-4">
            <div className="md:flex gap-1 hidden">
              <Link to="/post_product">
                <div className="flex flex-col items-center border w-28 md:w-36 border-primary bg-primary rounded-lg">
                  <MdOutlinePostAdd className="text-white" size={18} />
                  <p className="text-center text-xs md:text-base text-white">
                    Post a Product
                  </p>
                </div>
              </Link>
              <div className="flex justify-between px-2 items-center border p-1 border-primary bg-primary rounded-lg">
                <div className="flex items-center pr-3 gap-2">
                  <MdOutlineSort className="text-white text-3xl" />
                  <h3 className="text-xs sm:text-base text-white">Sort: </h3>
                </div>
                <div className="flex gap-2">
                  <select
                    className="rounded-sm outline-none bg-primary text-lg sm:text-base border border-white text-white"
                    value={freshnessFilter}
                    onChange={handleFreshnessFilter}
                  >
                    <option value="None">-None-</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Cooked">Cooked</option>
                  </select>
                  <select
                    className="rounded-sm outline-none bg-primary text-lg sm:text-base border border-white text-white"
                    value={productFilter}
                    onChange={handleProductFilter}
                  >
                    <option value="None">Tahong & Talaba</option>
                    <option value="Tahong">Tahong Only</option>
                    <option value="Talaba">Talaba Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="border-primary border w-full bg-[#FFFFFF] px-2 flex items-center gap-2 rounded-md ">
              <FaSearch size={20} className="text-primary" />
              <input
                type="search"
                placeholder="Search by name, caption, or description..."
                className="outline-none text-xs  md:text-base w-full h-8 md:h-10"
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="px-4 pb-2 flex flex-col gap-1 md:hidden">
            <div className="flex justify-between items-center border p-1 border-primary bg-primary rounded-lg">
              <div className="flex items-center gap-2">
                <MdOutlineSort className="text-white text-2xl sm:text-4xl" />
                <h3 className="text-xs sm:text-base text-white">Sort: </h3>
              </div>
              <div className="flex gap-2">
                <select
                  className="rounded-sm outline-none bg-primary text-xs sm:text-base border border-white text-white"
                  value={freshnessFilter}
                  onChange={handleFreshnessFilter}
                >
                  <option value="None">-None-</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Cooked">Cooked</option>
                </select>
                <select
                  className="rounded-sm outline-none bg-primary text-xs sm:text-base border border-white text-white"
                  value={productFilter}
                  onChange={handleProductFilter}
                >
                  <option value="None">Tahong & Talaba</option>
                  <option value="Tahong">Tahong Only</option>
                  <option value="Talaba">Talaba Only</option>
                </select>
              </div>
            </div>
            <Link
              className="btn btn-primary btn-sm sm:btn-md"
              to="/post_product"
            >
              <div className="flex justify-center items-center border w-full border-primary bg-primary rounded-lg">
                <MdOutlinePostAdd className="text-white" size={18} />
                <p className="text-center text-xs md:text-base text-white">
                  Post a Product
                </p>
              </div>
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-gray-500">
              No product found for "{searchQuery}". Please try a different
              search.
            </p>
          ) : (
            <div className=" grid grid-cols-1 px-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  className=" glass rounded-lg shadow p-4 cursor-pointer"
                  key={product.id}
                  to={`/product/info/${product.id}`}
                >
                  <div key={product.id}>
                    <div className="flex gap-2 py-2 items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <img
                          src={product.profilePhotoUrl}
                          alt="ProfilePhoto"
                          className="w-12 h-12 rounded-full object-cover inline-block"
                        />
                        <div>
                          <p className="text-primary text-sm font-semibold">
                            {product.firstName} {product.lastName}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {product.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h1 className="text-2xl font-semibold mb-2">
                        {product.caption}
                      </h1>
                      <p className="text-gray-700 mb-2">
                        {" "}
                        {capText(product.description)}
                      </p>
                      <p className="text-primary font-bold">
                        ₱ {product.price.toLocaleString()}.00
                      </p>
                    </div>

                    <div
                      className={`grid ${
                        product.photos.length > 2
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      } gap-2`}
                    >
                      {product.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          className={` ${
                            product.photos.length > 1 ? "h-36" : "h-72"
                          } w-full  object-cover rounded-lg mb-2`}
                          src={photo}
                          alt={`PostPic ${index} by ${product.firstName} ${product.lastName}`}
                        />
                      ))}

                      {product.photos.length > 3 && (
                        <div className="w-full shadow-primary shadow-sm h-36 object-cover rounded-lg mb-2 flex items-center justify-center cursor-pointer relative">
                          {/* Blurred background */}
                          <img
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            src={product.photos[3]}
                            alt="Blurry background"
                            style={{ filter: "blur(5px)" }}
                          />
                          {/* Click to see more text */}
                          <p className="text-white text-center font-semibold z-10">
                            Click to see more
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
