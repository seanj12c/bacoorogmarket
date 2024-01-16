import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const libraries = ["places"];

const ProductModal = ({ product, closeModal }) => {
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    setSlideshowIndex(0);
  }, [product]);

  const productLocation = {
    lat: product.location.latitude,
    lng: product.location.longitude,
  };

  const productMarked = {
    latitude: product.location.latitude,
    longitude: product.location.longitude,
  };

  const handleSlideshowChange = (direction) => {
    const lastIndex = product.photos.length - 1;
    setSlideshowIndex((prevIndex) =>
      direction === "prev"
        ? prevIndex > 0
          ? prevIndex - 1
          : lastIndex
        : prevIndex < lastIndex
        ? prevIndex + 1
        : 0
    );
  };

  if (!product) {
    return null; // Return null if product is not available yet
  }

  return (
    <div className="fixed inset-0 z-50 pt-24 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className="relative w-full mx-auto my-6 overflow-y-auto">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <div className="flex items-center">
              <img
                src={product.profilePhotoUrl}
                alt="ProfilePhoto"
                className="w-16 h-16 rounded-full object-cover inline-block"
              />
              <div className="ml-4">
                <p className="text-primary text-xs sm:text-sm font-semibold">
                  {`${product.firstName} ${product.lastName}`}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {product.timestamp}
                </p>
              </div>
            </div>
            <button
              className="p-2 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-2xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closeModal}
            >
              <span className="bg-transparent text-black opacity-5 h-8 w-8 text-xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-primary">
                {product.caption}
              </h1>
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                  Description:
                </h2>
                <p className="text-sm md:text-base sm:text-lg">
                  {product.description}
                </p>
              </div>
              {product.photos && product.photos.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                    Photos:
                  </h2>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleSlideshowChange("prev")}
                      className="text-primary text-xs sm:text-sm font-semibold py-2 px-4 rounded-full mr-4"
                    >
                      Previous
                    </button>
                    <img
                      src={product.photos[slideshowIndex]}
                      alt={`Product-Photos ${slideshowIndex + 1}`}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                    <button
                      onClick={() => handleSlideshowChange("next")}
                      className="text-primary text-xs sm:text-sm font-semibold py-2 px-4 rounded-full ml-4"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            {product.location ? (
              <div
                style={{ height: "400px", width: "100%", marginBottom: "20px" }}
              >
                <LoadScript
                  googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                  libraries={libraries}
                >
                  <GoogleMap
                    mapContainerStyle={{ height: "100%", width: "100%" }}
                    center={productLocation}
                    zoom={13}
                  >
                    {/* Marker for the product location */}
                    <Marker position={productMarked} />
                  </GoogleMap>
                </LoadScript>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                  Location:
                </h2>
                <p className="text-gray-500">No location data available.</p>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
            <button
              className="text-primary text-xs sm:text-sm font-semibold py-2 px-6 rounded-full"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
