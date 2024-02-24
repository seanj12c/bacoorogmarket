import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { IoMdCloseCircle } from "react-icons/io";
import markerIcon from "../../assets/marker.png";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";

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

  const handleMapClick = () => {
    const { latitude, longitude } = product.location;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      "_blank"
    );
  };

  if (!product) {
    return null; // Return null if product is not available yet
  }

  return (
    <div className="fixed h-screen rounded-lg w-full border-solid inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none">
      <div className=" w-full  mx-auto ">
        <div className=" h-screen border-2 overflow-y-auto relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex justify-between items-center  border-b border-solid">
            <div className="flex md:items-start items-center justify-between p-5 rounded-t md:w-1/2">
              <div className="flex items-center">
                <img
                  src={product.profilePhotoUrl}
                  alt="ProfilePhoto"
                  className="w-8 h-8 md:w-16 md:h-16 rounded-full object-cover inline-block"
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
            </div>

            <div>
              <button
                className=" text-black md:hidden text-2xl pr-5 font-semibold focus:outline-none"
                onClick={closeModal}
              >
                <IoMdCloseCircle size={30} className="text-red-500" />
              </button>
              <button
                className="text-primary hidden md:block text-xs sm:text-sm font-semibold py-2 px-6 rounded-full"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="w-full p-2">
            <div className="mb-4">
              {product.photos && product.photos.length > 0 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <button
                      onClick={() => handleSlideshowChange("prev")}
                      className="text-primary hidden md:block text-xs sm:text-sm font-semibold py-2 px-4 rounded-full mr-4"
                    >
                      <BiSolidSkipPreviousCircle size={30} />
                    </button>
                    <img
                      src={product.photos[slideshowIndex]}
                      alt={`Product-Photos ${slideshowIndex + 1}`}
                      className="w-56 h-56 sm:h-64 lg:h-80 sm:w-64 lg:w-80 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleSlideshowChange("next")}
                      className="text-primary hidden md:block text-xs sm:text-sm font-semibold py-2 px-4 rounded-full ml-4"
                    >
                      <BiSolidSkipNextCircle size={30} />
                    </button>
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => handleSlideshowChange("prev")}
                      className="text-primary md:hidden text-xs sm:text-sm font-semibold py-2 px-4 rounded-full mr-4"
                    >
                      <BiSolidSkipPreviousCircle size={30} />
                    </button>
                    <button
                      onClick={() => handleSlideshowChange("next")}
                      className="text-primary md:hidden text-xs sm:text-sm font-semibold py-2 px-4 rounded-full ml-4"
                    >
                      <BiSolidSkipNextCircle size={30} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between px-5 items-center">
              <div className="mt-2 w-[600px] md:hidden">
                <h1 className="font-bold text-base sm:text-lg text-primary">
                  {product.caption}
                </h1>
                <p className=" text-xs sm:text-base">
                  <span className="text-primary font-bold">Price:</span> ₱
                  {product.price.toLocaleString()}
                  .00
                </p>
                <p className="text-primary text-xs sm:text-lg font-bold">
                  Description:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-lg">
                  {product.description}
                </p>
                <p className="text-primary text-xs sm:text-lg font-bold">
                  Address:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-lg">
                  {product.address}
                </p>
              </div>
            </div>
            <div className="flex p-6 items-center justify-around flex-col md:flex-row">
              <div className="md:w-1/2">
                <div className="w-full">
                  <h1 className=" text-xs sm:text-lg hidden md:block font-bold text-primary">
                    {product.caption}
                  </h1>
                  <p className="text-xs  md:text-start hidden md:block sm:text-base">
                    {product.description}
                  </p>

                  <h1
                    onClick={handleMapClick}
                    className="text-center text-xs md:text-base text-primary "
                  >
                    Click the Map to locate the Seller
                  </h1>
                </div>

                {product.location ? (
                  <div className="mx-auto mb-5 h-40 md:h-72 w-full md:w-72 lg:w-96 cursor-pointer shadow-sm shadow-primary rounded-lg p-1">
                    <LoadScript
                      googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                      libraries={libraries}
                    >
                      <GoogleMap
                        mapContainerStyle={{ height: "100%", width: "100%" }}
                        center={productLocation}
                        zoom={16}
                        options={{
                          draggable: false,
                          zoomControl: false,
                          gestureHandling: "none",
                          mapTypeControl: false,
                          streetViewControl: false,
                          fullscreenControl: false,
                          borderRadius: "8px",
                        }}
                        onClick={handleMapClick}
                      >
                        <CustomOverlay
                          position={productLocation}
                          onClick={handleMapClick}
                        />
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
                <div className="flex justify-center">
                  <button className="bg-primary text-xs text-white text-center px-3 w-32 py-2 rounded-lg">
                    Message Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomOverlay = ({ position, text }) => {
  const overlayStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -85%)",
  };

  return (
    <div style={overlayStyle}>
      <img
        src={markerIcon}
        alt="Marker"
        className="h-10 w-10 object-contain bg-transparent"
      />
    </div>
  );
};

export default ProductModal;
