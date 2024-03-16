import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase"; // Import your Firebase instance
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import check from "../../assets/check.gif";
import uploadload from "../../assets/loading.gif";

const Modal = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="h-screen bg-black px-4 md:px-0 bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="md:text-2xl text-xl font-semibold my-2">
          Product Updated!
        </h2>
        <img className="mx-auto h-20 object-contain" src={check} alt="" />
        <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-6 mt-4">
          <Link
            to="/marketplace"
            className="bg-primary text-xs md:text-base text-center text-white px-4 py-2 rounded-lg hover-bg-primary-dark focus:outline-none"
          >
            Go to Marketplace
          </Link>
          <Link
            to="/myaccount"
            className="bg-primary text-xs md:text-base text-center text-white px-4 py-2 rounded-lg hover-bg-primary-dark focus:outline-none"
          >
            Go to My Account
          </Link>
        </div>
      </div>
    </div>
  );
};

const EditProduct = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { productId } = useParams();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchBoxRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const libraries = ["places"];
  const [loading, setLoading] = useState(true);

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(firestore, "products", productId), formData);
      window.alert("Product successfully updated!");
      navigate("/marketplace");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    try {
      setIsSubmitting(true);

      setIsModalOpen(true);
    } catch (error) {
      window.alert("Error adding product");
      setIsSubmitting(false);
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
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <h2 className="text-2xl text-center font-bold text-primary pt-24 mb-3">
            Edit Product
          </h2>
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
                placeholder="Other Information of the Product"
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
          <Modal show={isModalOpen} onClose={closeModal} />
        </div>
      )}
    </div>
  );
};

export default EditProduct;
