import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { useNavigate, useParams } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import uploadload from "../../assets/loading.gif";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import { IoReturnDownBackOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const EditProduct = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { productId } = useParams();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchBoxRef = useRef(null);

  const libraries = ["places"];
  const [loading, setLoading] = useState(true);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [formData, setFormData] = useState({
    caption: "",
    description: "",
    freshnessValue: "Fresh",
    productNameValue: "Tahong",
    price: "",
    address: "",
    otherInformation: "",
    photoPreviews: [],
  });

  const [defaultLocation, setDefaultLocation] = useState({
    lat: 14.4576,
    lng: 120.9429,
  });

  const handleMapClick = (e) => {
    setSelectedLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    });
  };

  const mapOptions = {
    disableDefaultUI: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  useEffect(() => {
    const getProductData = async () => {
      try {
        const productDoc = await getDoc(doc(firestore, "products", productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();

          setFormData({
            caption: productData.caption || "",
            description: productData.description || "",

            price: productData.price || "",
            address: productData.address || "",
            otherInformation: productData.otherInformation || "",
            photoPreviews: productData.photos || [],
          });
          if (
            productData.location &&
            productData.location.latitude &&
            productData.location.longitude
          ) {
            setDefaultLocation({
              lat: productData.location.latitude,
              lng: productData.location.longitude,
            });
          }

          console.log("Document data:", productData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting product document:", error);
      } finally {
        setLoading(false);
      }
    };
    getProductData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(firestore, "products", productId), formData);
      setIsSubmitting(true);

      Swal.fire({
        icon: "success",
        title: "Product Updated!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/marketplace");
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error adding recipe: ", error);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again later.",
        confirmButtonColor: "#008080",
      });
    }
  };

  const handleSlideshowChange = (direction) => {
    const lastIndex = formData.photoPreviews.length - 1;
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
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1); // This will navigate back in the history stack
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
        <div className="p-4 md:pb-0 pb-20 sm:p-6 md:p-8 lg:p-10">
          <div className="pt-24 ">
            <button
              className="btn btn-xs md:btn-sm btn-error text-white btn-primary"
              onClick={goBack}
            >
              Go Back{" "}
              <IoReturnDownBackOutline className="md:hidden" size={15} />
              <IoReturnDownBackOutline className="hidden md:block" size={20} />
            </button>{" "}
            <h2 className="text-2xl text-center font-bold text-primary ">
              Edit Product
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                <div>
                  <img
                    src={formData.photoPreviews[slideshowIndex]}
                    alt={`Product-Photos ${slideshowIndex + 1}`}
                    className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                  />
                  <img
                    src={formData.photoPreviews[slideshowIndex]}
                    alt={`Product-Photos ${slideshowIndex + 1}`}
                    className="w-full max-w-md mx-auto h-56 sm:h-64 p-1 lg:h-72 object-contain rounded-lg relative z-10"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-error mb-3 text-xs text-center">
              Sorry, image can't be edited.
            </h1>
            <div className="flex justify-center gap-20 pb-5 w-full">
              <button
                onClick={() => handleSlideshowChange("prev")}
                className={`text-white btn btn-sm text-3xl md:text-4xl md:btn-md btn-circle ${
                  formData.photoPreviews && formData.photoPreviews.length > 1
                    ? "btn-primary"
                    : "btn-disabled cursor-not-allowed"
                }`}
                disabled={
                  formData.photoPreviews && formData.photoPreviews.length <= 1
                }
              >
                <BiSolidSkipPreviousCircle />
              </button>
              <button
                onClick={() => handleSlideshowChange("next")}
                className={`text-white btn btn-sm text-3xl md:text-4xl md:btn-md btn-circle ${
                  formData.photoPreviews && formData.photoPreviews.length > 1
                    ? "btn-primary"
                    : "btn-disabled cursor-not-allowed"
                }`}
                disabled={
                  formData.photoPreviews && formData.photoPreviews.length <= 1
                }
              >
                <BiSolidSkipNextCircle />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="caption" className="text-lg text-primary">
                Product Name
              </label>
              <input
                type="text"
                id="caption"
                name="caption"
                className="w-full border rounded p-2 mb-3"
                placeholder="Name of your Product"
                value={formData.caption}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="text-lg text-primary">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full border rounded p-2 mb-3"
                placeholder="Description of the Product"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <h3 className="text-lg text-primary">Price</h3>
            <div className="flex border rounded focus:outline-1 items-center w-28 h-full mb-3 pl-2">
              <p className="font-bold">₱</p>
              <input
                required
                type="number"
                id="priceInput"
                className="w-full focus:outline-none p-2 "
                placeholder="Price"
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="text-lg text-primary">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="w-full border rounded p-2 mb-3"
                placeholder="Address of the Product"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div
              style={{ height: "400px", width: "100%", marginBottom: "20px" }}
            >
              <LoadScript
                googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                libraries={libraries}
              >
                <StandaloneSearchBox
                  onLoad={(ref) => {
                    searchBoxRef.current = ref;
                  }}
                  onPlacesChanged={() => {
                    if (searchBoxRef.current) {
                      const places = searchBoxRef.current.getPlaces();
                      if (places.length > 0) {
                        const { location } = places[0].geometry;
                        setSelectedLocation({
                          latitude: location.lat(),
                          longitude: location.lng(),
                        });
                      }
                    }
                  }}
                >
                  <input
                    className="text-lg text-black"
                    type="text"
                    placeholder="Search for a location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      boxSizing: "border-box",
                      border: "1px solid transparent",
                      width: "100%",
                      height: "32px",
                      padding: "0 12px",
                      borderRadius: "3px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                      fontSize: "14px",
                      outline: "none",
                      textOverflow: "ellipses",
                    }}
                  />
                </StandaloneSearchBox>
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  center={
                    selectedLocation
                      ? {
                          lat: selectedLocation.latitude,
                          lng: selectedLocation.longitude,
                        }
                      : defaultLocation
                  }
                  zoom={13}
                  onClick={handleMapClick}
                  options={mapOptions}
                >
                  <Marker
                    position={{
                      lat: defaultLocation.lat,
                      lng: defaultLocation.lng,
                    }}
                  />
                  {selectedLocation && (
                    <Marker
                      position={{
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude,
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
            <div className="mb-3 pt-10">
              <label
                htmlFor="otherInformation"
                className="text-lg text-primary"
              >
                Other Information
              </label>
              <textarea
                id="otherInformation"
                name="otherInformation"
                className="w-full border rounded p-2 mb-3"
                placeholder="Optional"
                value={formData.otherInformation}
                onChange={handleChange}
              />
            </div>
            <div className="flex  justify-center w-full">
              <button
                type="submit"
                className="btn-wide btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Updating Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditProduct;
