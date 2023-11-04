import React, { useState, useEffect } from "react";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import { useGeolocated } from "react-geolocated"; // Import useGeolocated from react-geolocated

const MapComponent = withScriptjs(
  withGoogleMap(({ latitude, longitude, onLocationChange }) => {
    // The map code remains the same

    useEffect(() => {
      // Perform any side effects here (similar to componentDidMount)
    }, []); // Empty dependency array to mimic componentDidMount

    return (
      <GoogleMap
        defaultZoom={15}
        defaultCenter={{ lat: latitude, lng: longitude }}
        onClick={(e) =>
          onLocationChange({
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
          })
        }
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
    );
  })
);

const PostAProduct = () => {
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  // Use useGeolocated hook to get geolocation information
  const { coords } = useGeolocated();

  const handlePhotoUpload = (e) => {
    const selectedPhoto = e.target.files[0];
    setPhoto(selectedPhoto);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product Data:", {
      photo,
      caption,
      price,
      location,
    });
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Post a Product</h2>
      <form onSubmit={handleSubmit}>
        {/* ... (other form fields) */}
        <div className="mb-4">
          <label
            htmlFor="photo"
            className="block text-gray-700 font-medium mb-2"
          >
            Product Photo
          </label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="border rounded w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="caption"
            className="block text-gray-700 font-medium mb-2"
          >
            Caption
          </label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="border rounded w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="price"
            className="block text-gray-700 font-medium mb-2"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border rounded w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Location
          </label>
          <div className="flex items-center">
            <MapComponent
              latitude={coords ? coords.latitude : location.latitude}
              longitude={coords ? coords.longitude : location.longitude}
              onLocationChange={(newLocation) => setLocation(newLocation)}
              googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyA5hi79NlSlI2DIEDKM7G-P7GCkl8IeEG0&callback=initMap`}
              loadingElement={<div style={{ height: "100%" }} />}
              containerElement={<div style={{ height: "300px" }} />}
              mapElement={<div style={{ height: "100%" }} />}
            />
          </div>
        </div>
        <div className="mb-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Post Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostAProduct;
