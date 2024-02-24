import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../authContext";
import { firestore } from "../../firebase";
import { Link } from "react-router-dom";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import uploadload from "../../assets/loading.gif";
import check from "../../assets/check.gif";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const libraries = ["places"];

const Modal = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="h-screen bg-black px-4 md:px-0 bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="md:text-2xl text-xl font-semibold my-2">
          Thank you for submitting your product, it will now display on
          Marketplace pages!
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

const PostAProduct = () => {
  const auth = useAuth();
  const user = auth.currentUser;
  const userUid = user ? user.uid : "unknown";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const now = new Date();
  const priceInput = document.getElementById("priceInput");
  const priceValue = priceInput ? parseFloat(priceInput.value) || 0 : 0;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedTimestamp = now.toLocaleDateString("en-US", options);

  const defaultLocation = {
    lat: 14.4576,
    lng: 120.9429,
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const registeredDoc = doc(firestore, "registered", userUid);
        const docSnapshot = await getDoc(registeredDoc);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setProfilePhotoUrl(userData.profilePhotoUrl);
        }
      } catch (error) {
        console.error("Error retrieving user information: ", error);
      }
    };

    getUserInfo();
  }, [userUid]);

  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoRequired, setIsPhotoRequired] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBoxRef = useRef(null);
  const [description, setDescription] = useState("");
  const [freshnessValue, setFreshnessValue] = useState("Fresh");
  const [productNameValue, setProductNameValue] = useState("Tahong");
  const [price, setPrice] = useState("");
  const [otherInformation, setOtherInformation] = useState("");
  const [address, setAddress] = useState("");

  const handlePriceChange = (event) => {
    const inputPrice = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const formattedPrice =
      inputPrice === "" ? "0" : parseInt(inputPrice, 10).toLocaleString(); // Check if input is empty and set to '0'
    setPrice(formattedPrice);
  };

  const handleOtherInformationChange = (e) => {
    setOtherInformation(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleFreshnessChange = (e) => {
    setFreshnessValue(e.target.value);
  };

  const handleProductNameChange = (e) => {
    setProductNameValue(e.target.value);
  };

  const [errors, setErrors] = useState({
    caption: "",
    photos: "",
  });

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleMapClick = (e) => {
    setSelectedLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    });
  };

  const fileInputRef = useRef(null);

  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current.click();
  };

  const handleFilesSelected = (e) => {
    const selectedPhotos = e.target.files;

    if (selectedPhotos.length === 0) {
      setIsPhotoRequired(true);
      return;
    }

    setIsPhotoRequired(false);

    for (const photo of selectedPhotos) {
      uploadPhoto(photo);
    }
  };

  const uploadPhoto = async (photo) => {
    try {
      const storage = getStorage();

      const storageRef = ref(storage, `recipe_photos/${userUid}/${photo.name}`);

      setPhotoPreviews((prevPreviews) => [...prevPreviews, uploadload]);

      await uploadBytes(storageRef, photo);
      const downloadURL = await getDownloadURL(storageRef);

      setPhotos((prevPhotos) => [...prevPhotos, downloadURL]);
      setPhotoPreviews((prevPreviews) => [
        ...prevPreviews.slice(0, prevPreviews.length - 1),
        URL.createObjectURL(photo),
      ]);
    } catch (error) {
      console.error("Error uploading photo: ", error);
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    const updatedPreviews = [...photoPreviews];

    updatedPhotos.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);

    deletePhotoFromStorage(index);
  };

  const deletePhotoFromStorage = async (index) => {
    const photoURL = photos[index];

    const storageRef = ref(getStorage(), photoURL);

    try {
      await deleteObject(storageRef);
      console.log("Photo deleted from Storage: ", photoURL);
    } catch (error) {
      console.error("Error deleting photo from Storage: ", error);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      caption: "",
      description: "",
      photos: "",
      profilePhotoUrl,
      firstName,
      lastName,
      formattedTimestamp,
    };

    if (photos.length === 0) {
      valid = false;
      newErrors.photos = "A photo is required.";
    }

    if (!description.trim()) {
      valid = false;
      newErrors.description = "Description is required.";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedLocation) {
      alert("Please pin your location on the map.");
      return;
    }

    const productData = {
      caption,
      description,
      photos,
      userUid,
      price: priceValue,
      location: selectedLocation,
      timestamp: formattedTimestamp,
      profilePhotoUrl,
      firstName,
      lastName,
      typeOfProduct: {
        freshness: freshnessValue,
        productName: productNameValue,
      },
      otherInformation,
      address,
    };

    const productsRef = collection(firestore, "products");

    try {
      setIsSubmitting(true);
      await addDoc(productsRef, productData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const mapOptions = {
    disableDefaultUI: true,
    fullscreenControl: true,
    zoomControl: true,
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-2xl text-center  font-bold text-primary pt-24 mb-3">
        Post a Product
      </h2>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg text-primary">Product Name</h3>
        <input
          type="text"
          className="w-full border rounded p-2 mb-3"
          placeholder="Name of your Product"
          value={caption}
          onChange={handleCaptionChange}
        />
        {errors.caption && <p className="text-red-600">{errors.caption}</p>}
        <h3 className="text-lg text-primary">Description</h3>
        <textarea
          className="w-full border rounded p-2 mb-3"
          placeholder="Description of the Product"
          value={description}
          onChange={handleDescriptionChange}
        />
        <div className="mb-3 flex flex-col  gap-2">
          <h3 className="text-lg text-primary">Type of Product</h3>
          <div className="flex gap-2">
            <select
              className="bg-white border rounded"
              value={freshnessValue}
              onChange={handleFreshnessChange}
            >
              <option value="Fresh">Fresh</option>
              <option value="Cooked">Cooked</option>
            </select>

            <select
              className="bg-white border rounded"
              value={productNameValue}
              onChange={handleProductNameChange}
            >
              <option value="Tahong">Tahong</option>
              <option value="Talaba">Talaba</option>
              <option value="Tahong & Talaba">Tahong & Talaba</option>
            </select>
          </div>
        </div>
        {errors.description && (
          <p className="text-red-600">{errors.description}</p>
        )}
        <div className="mb-5">
          <h3 className="text-lg text-primary">Photo Upload</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {photoPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative w-20 h-20 justify-center items-center"
              >
                {preview === uploadload ? (
                  <img
                    src={preview}
                    alt="Uploading..."
                    className="w-10 h-10 pt-6 m-auto flex justify-center items-center object-contain rounded"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 text-red-500 text-lg hover:text-red-600 focus:outline-none cursor-pointer"
                >
                  <RiCloseLine />
                </button>
                {isPhotoRequired && <p className="hidden"></p>}
              </div>
            ))}
            <div
              className="w-20 h-20 border rounded flex items-center justify-center cursor-pointer"
              onClick={handlePhotoUpload}
            >
              <RiAddLine size={32} color="#6B7280" />
            </div>
          </div>

          <input
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
          />
          {errors.photos && <p className="text-red-600">{errors.photos}</p>}
          <h3 className="text-lg text-primary">Price</h3>
          <div className="flex border rounded focus:outline-1 items-center w-28 h-full mb-3 pl-2">
            <p className="font-bold">₱</p>
            <input
              required
              type="text"
              id="priceInput"
              className="w-full focus:outline-none p-2 "
              placeholder="Price"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              value={price}
              onChange={handlePriceChange}
            />
          </div>

          <h3 className="text-lg text-primary">Address</h3>
          <input
            type="text"
            className="w-full border rounded p-2 mb-3"
            placeholder="Your full address here"
            value={address}
            onChange={handleAddressChange}
            required
          />

          <p className="text-xs sm:text-base underline text-primary text-center">
            Please pin your location on the map below.
          </p>

          <div style={{ height: "400px", width: "100%", marginBottom: "20px" }}>
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
        </div>

        <div className="mt-10">
          <h3 className="text-lg text-primary ">Other Information</h3>
          <input
            type="text"
            className="w-full border rounded p-2 mb-3"
            placeholder="Optional"
            value={otherInformation}
            onChange={handleOtherInformationChange}
          />
        </div>
        <div className="flex justify-center w-full">
          <button
            type="submit"
            className="bg-primary  w-full max-w-sm text-white py-2 px-4 rounded hover:bg-primary-dark focus:outline-none cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Product"}
          </button>
        </div>
      </form>
      <Modal show={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default PostAProduct;
