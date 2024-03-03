import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const AdminLocations = () => {
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
          product.lastName
        ) {
          locationsData.push({
            id: doc.id,
            latitude: product.location.latitude,
            longitude: product.location.longitude,
            firstName: product.firstName,
            lastName: product.lastName,
          });
        }
      });
      console.log("Locations Data:", locationsData);
      setLocations(locationsData);
      setLoading(false);

      localStorage.setItem("productLocations", JSON.stringify(locationsData));
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
        <div className="h-screen md:pt-0 pt-24 w-full">
          <div className="md:hidden">
            <NavbarAdmin
              users="bg-white text-primary "
              locations="bg-primary text-white"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-28 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-2xl lg:text-3xl">
                  Admin Panel
                </h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-6">
                <Link to="/admin/users">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaUsers size={25} />
                    Users
                  </li>
                </Link>
                <Link to="/admin/locations">
                  <li className="bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <LiaSearchLocationSolid size={25} className="text-white" />
                    Locations
                  </li>
                </Link>
                <Link to="/admin/products">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <GiMussel size={25} />
                    Products
                  </li>
                </Link>
                <Link to="/admin/recipes">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineRestaurantMenu size={25} />
                    Recipes
                  </li>
                </Link>
              </ul>
            </div>
            {/* Map */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                Product Locations
              </h1>

              <div className="overflow-auto">
                <LoadScript
                  googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                  libraries={["places"]}
                >
                  <GoogleMap
                    mapContainerStyle={{ height: "300px", width: "100%" }}
                    center={defaultCenter}
                    zoom={13}
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
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
                        <div>
                          <h2>{`${selectedLocation.firstName} ${selectedLocation.lastName}`}</h2>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
              <div>
                <h1 className="text-2xl font-bold my-4 text-center">
                  Product Locations
                </h1>
                <div className="overflow-auto">
                  <table className="w-full text-xs text-center border-separate	 bg-gray-200">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="p-1">First Name</th>
                        <th className="p-1">Last Name</th>
                        <th className="p-1">Latitude</th>
                        <th className="p-1">Longitude</th>
                        <th className="p-1">Direction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => (
                        <tr key={location.id}>
                          <td className="p-1">{location.firstName}</td>
                          <td className="p-1">{location.lastName}</td>
                          <td className="p-1">{location.latitude}</td>
                          <td className="p-1">{location.longitude}</td>
                          <td className="p-1">
                            <button className="p-1 bg-primary text-white rounded-md">
                              Get Direction
                            </button>
                          </td>
                        </tr>
                      ))}
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

export default AdminLocations;
