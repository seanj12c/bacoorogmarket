import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import ProductModal from "./ProductModal";
import uploadload from "../../assets/loading.gif";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsCollection = collection(firestore, "products");
    const productsQuery = query(
      productsCollection,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          caption: data.caption,
          description: data.description,
          location: data.location,
          photos: data.photos,
          profilePhotoUrl: data.profilePhotoUrl,
          price: data.price,
          firstName: data.firstName,
          lastName: data.lastName,
          timestamp: data.timestamp,
        });
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const capText = (text) => {
    return text.length > 35 ? text.substring(0, 35) + "..." : text;
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
        <div className="grid grid-cols-1 py-24 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer"
              onClick={() => openProductModal(product)}
            >
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
                    <p className="text-gray-500 text-xs">{product.timestamp}</p>
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
                <p className="text-primary font-bold">₱ {product.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    className="w-full h-36 object-cover rounded-lg mb-2"
                    src={photo}
                    alt={`PostPic ${index} by ${product.firstName} ${product.lastName}`}
                  />
                ))}
                {product.photos.length > 3 && (
                  <div
                    className="w-full shadow-primary shadow-sm h-36 object-cover rounded-lg mb-2 flex items-center justify-center cursor-pointer relative"
                    onClick={() => openProductModal(product)}
                  >
                    {/* Blurred background */}
                    <img
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      src={product.photos[3]}
                      alt="Blurry background"
                      style={{ filter: "blur(5px)" }}
                    />
                    {/* Click to see more text */}
                    <p className="text-white font-semibold z-10">
                      Click to see more
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          closeModal={closeProductModal}
        />
      )}
    </div>
  );
};

export default Marketplace;
