import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { Link } from "react-router-dom"; // Import Link from React Router

import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const Sellers = () => {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
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
          product.userUid
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
      console.log("Locations Data:", locationsData);
      setLocations(locationsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const defaultCenter = {
    lat: 14.4576,
    lng: 120.9429,
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
        <div className="h-screen pt-24 md:pb-0 pb-20 w-full">
          <div className="md:flex md:flex-row">
            <div className="container  mx-auto px-4">
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
                    {locations.map((location) => (
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
                        <div className="text-xs items-center">
                          <h2>{`${selectedLocation.firstName} ${selectedLocation.lastName}`}</h2>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold my-4 text-center">
                  {selectedLocation
                    ? "Selected Location Details"
                    : "Please tap the marker on the map"}
                </h1>
                <div className="overflow-auto">
                  <table className="w-full table table-xs text-xs text-center border-separate bg-gray-200">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="p-1">Name</th>
                        <th className="p-1">Address</th>
                        <th className="p-1">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLocation ? (
                        <tr>
                          <td className="p-1">
                            {selectedLocation.firstName}{" "}
                            {selectedLocation.lastName}
                          </td>
                          <td className="p-1">{selectedLocation.address}</td>
                          <td className="md:flex justify-center gap-2">
                            <Link
                              to={`/profile/${selectedLocation.userId}`}
                              className="font-normal btn-xs md:btn-md btn btn-primary text-white"
                            >
                              Go to Profile
                            </Link>
                            <Link
                              to={`/product/info/${selectedLocation.id}`}
                              className="font-normal btn-xs md:btn-md btn btn-primary text-white"
                            >
                              Go to Product
                            </Link>
                            <button
                              className="font-normal btn-xs md:btn-md btn btn-primary text-white"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`,
                                  "_blank"
                                )
                              }
                            >
                              Get Direction
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-1">
                            No location selected
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;
