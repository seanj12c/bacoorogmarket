// Inside the Sellers component

import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { Link } from "react-router-dom";

import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { FaSearch } from "react-icons/fa";

const Sellers = () => {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State to hold search query

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserID(user.uid);
      } else {
        setCurrentUserID(null);
      }
    });

    const productsCollection = collection(firestore, "products");
    const productsQuery = query(productsCollection);

    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const locationsData = [];
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        if (
          product.location &&
          product.location.latitude &&
          product.location.longitude &&
          product.firstName &&
          product.lastName &&
          product.address &&
          product.userUid &&
          !product.isHidden // Only add location if isHidden is false
        ) {
          locationsData.push({
            id: doc.id,
            latitude: product.location.latitude,
            longitude: product.location.longitude,
            firstName: product.firstName,
            lastName: product.lastName,
            address: product.address,
            userId: product.userUid,
          });
        }
      });
      setLocations(locationsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const defaultCenter = {
    lat: 14.4576,
    lng: 120.9429,
  };

  // Filter locations based on search query or selectedLocation
  const filteredLocations = selectedLocation
    ? [selectedLocation]
    : locations.filter((location) => {
        const fullName =
          `${location.firstName} ${location.lastName}`.toLowerCase();
        const address = location.address.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || address.includes(query);
      });

  return (
    <div className="md:pb-0 pb-32">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <img
            className="lg:h-32 h-20 md:h-28 object-contain mx-auto"
            src={uploadload}
            alt=""
          />
        </div>
      ) : (
        <div className="h-screen pt-24 w-full">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold my-4 text-center">
              Sellers Locations
            </h1>

            <div className="overflow-auto">
              <LoadScript
                googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                libraries={["places"]}
              >
                <GoogleMap
                  mapContainerStyle={{ height: "300px", width: "100%" }}
                  center={defaultCenter}
                  zoom={12}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    borderRadius: "8px",
                  }}
                >
                  {/* Render markers for filtered locations */}
                  {filteredLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                      onClick={() => {
                        setSelectedLocation(location);
                      }}
                    />
                  ))}
                  {/* Render selected location info window */}
                  {selectedLocation && (
                    <InfoWindow
                      position={{
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude,
                      }}
                      onCloseClick={() => {
                        setSelectedLocation(null);
                      }}
                    >
                      <div className=" flex items-center justify-center mx-auto">
                        <h2 className="text-center">{`${selectedLocation.firstName} ${selectedLocation.lastName}`}</h2>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
            {/* Render location details table */}
            <div>
              <h1 className="text-lg md:text-2xl font-bold my-4 text-center">
                {selectedLocation
                  ? "Selected Location Details"
                  : "All Locations"}
              </h1>
              <div className="border-primary mb-2 border w-full  px-2 flex items-center gap-2 rounded-md ">
                <FaSearch size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search by name or address"
                  className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="overflow-auto">
                {filteredLocations.length === 0 ? (
                  <p className="text-center">No locations found.</p>
                ) : (
                  <table className="w-full table table-xs text-xs text-center border-separate bg-gray-200">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="p-1">Name</th>
                        <th className="p-1">Address</th>
                        <th className="p-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((location) => (
                        <tr key={location.id}>
                          <td className="p-1">
                            {location.firstName} {location.lastName}
                          </td>
                          <td className="p-1">{location.address}</td>
                          <td className="flex justify-center flex-col md:flex-row w-full gap-2">
                            {currentUserID !== location.userId && (
                              <Link
                                to={`/profile/${location.userId}`}
                                className="font-normal btn-xs md:btn-sm btn btn-primary text-white"
                              >
                                Go to Profile
                              </Link>
                            )}
                            <Link
                              to={`/product/info/${location.id}`}
                              className="font-normal btn-xs md:btn-sm btn btn-primary text-white"
                            >
                              {currentUserID === location.userId
                                ? "Go to My Product"
                                : "Go to Product"}
                            </Link>
                            <button
                              className="font-normal btn-xs md:btn-sm btn btn-primary text-white"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
                                  "_blank"
                                )
                              }
                            >
                              {currentUserID === location.userId
                                ? "Go to My Direction"
                                : "Get Direction"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;
