import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import { IoMdCloseCircle } from "react-icons/io";
import markerIcon from "../../assets/marker.png";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";

const libraries = ["places"];

const ProductModal = ({ product, closeModal }) => {
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const auth = useAuth();

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

  console.log("Product:", product);

  const handleMapClick = () => {
    const { latitude, longitude } = product.location;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      "_blank"
    );
  };

  const handleOpenInNewTab = () => {
    const confirmOpen = window.confirm(
      "Do you want to view this photo in a new tab?"
    );
    if (confirmOpen) {
      window.open(product.photos[slideshowIndex], "_blank");
    }
  };

  if (!product) {
    return null;
  }

  const isSeller = auth.currentUser && auth.currentUser.uid === product.userUid;

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
                  {isSeller ? (
                    <Link
                      onClick={closeModal}
                      to={`/edit_product/${product.id}`}
                      className="btn  btn-xs text-xs btn-primary"
                    >
                      Edit Product
                    </Link>
                  ) : (
                    <Link
                      onClick={closeModal}
                      to={`/profile/${product.userUid}`}
                      className="btn btn-xs text-xs btn-primary"
                    >
                      View Profile
                    </Link>
                  )}
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
          <div className="w-full md:flex gap-3 lg:gap-5 justify-around p-2">
            <div className="md:w-1/2">
              <div className="mb-4">
                {product.photos && product.photos.length > 0 && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                        {/* Wrap the div in an onClick event handler */}
                        <div onClick={handleOpenInNewTab}>
                          {/* Background image */}
                          <img
                            src={product.photos[slideshowIndex]}
                            alt={`Product-Photos ${slideshowIndex + 1}`}
                            className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                          />
                          {/* Image */}
                          <img
                            src={product.photos[slideshowIndex]}
                            alt={`Product-Photos ${slideshowIndex + 1}`}
                            className="w-full max-w-md mx-auto h-56 sm:h-64 p-1 lg:h-72 object-contain rounded-lg relative z-10"
                          />
                          <h1 className="text-center underline text-xs md:text-base">
                            Click the photo to view in full-screen
                          </h1>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-20 pb-5 w-full">
                      <button
                        onClick={() => handleSlideshowChange("prev")}
                        className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                          product.photos && product.photos.length > 1
                            ? "btn-primary"
                            : "btn-disabled cursor-not-allowed"
                        }`}
                        disabled={product.photos && product.photos.length <= 1}
                      >
                        <BiSolidSkipPreviousCircle size={30} />
                      </button>
                      <button
                        onClick={() => handleSlideshowChange("next")}
                        className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                          product.photos && product.photos.length > 1
                            ? "btn-primary"
                            : "btn-disabled cursor-not-allowed"
                        }`}
                        disabled={product.photos && product.photos.length <= 1}
                      >
                        <BiSolidSkipNextCircle size={30} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between px-5 items-center">
                <div className="mt-2 w-[600px] ">
                  <h1 className="font-bold text-lg sm:text-xl text-primary mb-1">
                    {product.caption}
                  </h1>
                  <p className=" text-xs sm:text-base mb-1">
                    <span className="text-primary font-bold">Price:</span> ₱
                    {product.price.toLocaleString()}
                    .00
                  </p>
                  <div className="hidden md:block">
                    {product.otherInformation ? (
                      <div>
                        <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                          Other Information:
                        </h2>
                        <h2 className="text-xs sm:text-base mb-1">
                          {product.otherInformation}
                        </h2>
                      </div>
                    ) : (
                      <div className="hidden md:block">
                        <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                          Other Information:
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-base mb-1">
                          No other information
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="md:hidden">
                    <p className="text-primary text-xs sm:text-lg font-bold">
                      Description:{" "}
                    </p>
                    <p className=" text-xs  md:text-start sm:text-base mb-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="md:hidden my-2 w-full border"></div>

                  <div className="md:hidden">
                    <p className="text-primary text-xs sm:text-lg font-bold">
                      Address:{" "}
                    </p>
                    <p className=" text-xs  md:text-start sm:text-base">
                      {product.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:block hidden h-full border"></div>

            <div className="md:w-1/2">
              <div className="md:block hidden">
                <p className="text-primary text-xs sm:text-lg font-bold">
                  Description:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-base mb-1">
                  {product.description}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-primary text-xs sm:text-lg  font-bold">
                  Address:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-base">
                  {product.address}
                </p>
              </div>
              <div className="mx-auto justify-center mb-5 h-40 md:h-80 w-full md:w-80 lg:w-full object-cover cursor-pointer mt-1 px-7">
                <h1
                  onClick={handleMapClick}
                  className="text-center text-xs lg:text-base text-primary "
                >
                  Click the Map to locate the Seller
                </h1>
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
              </div>
              <div className="px-3 md:hidden">
                {product.otherInformation ? (
                  <div>
                    <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                      Other Information:
                    </h2>
                    <h2 className="text-xs sm:text-base mb-1">
                      {product.otherInformation}
                    </h2>
                  </div>
                ) : (
                  <div className="px-3 md:hidden">
                    <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                      Other Information:
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-base mb-1">
                      No other information
                    </p>
                  </div>
                )}
              </div>
              {isSeller ? null : (
                <div className="flex flex-col justify-center mt-1">
                  <h1 className="text-lg text-center w-full font-bold pb-2">
                    Want to talk to {product.firstName}?
                  </h1>

                  <div className="flex justify-center">
                    <button className="btn-sm md:btn-xs lg:btn-sm btn btn-primary">
                      <Link to="/chat">Go to Chats</Link>
                    </button>
                  </div>
                </div>
              )}
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
