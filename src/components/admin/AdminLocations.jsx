import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";
import Swal from "sweetalert2";

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
          product.lastName &&
          product.address
        ) {
          locationsData.push({
            id: doc.id,
            latitude: product.location.latitude,
            longitude: product.location.longitude,
            firstName: product.firstName,
            lastName: product.lastName,
            address: product.address,
          });
        }
      });
      console.log("Locations Data:", locationsData);
      setLocations(locationsData);
      setLoading(false);

      // localStorage.setItem("productLocations", JSON.stringify(locationsData));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const defaultCenter = {
    lat: 14.4576,
    lng: 120.9429,
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const productRef = doc(firestore, "products", productId);
      try {
        await deleteDoc(productRef);
        console.log("Document successfully deleted!");
        Swal.fire("Deleted!", "Your product has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting document: ", error);
        Swal.fire(
          "Error!",
          "An error occurred while deleting the product.",
          "error"
        );
      }
    }
  };

  const navigate = useNavigate();

  const handleLogoutConfirmation = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout();
      }
    });
  };

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
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
        <div className="h-screen md:pt-0 pt-24 w-full">
          <div className="md:hidden">
            <NavbarAdmin
              users="bg-white text-primary "
              locations="bg-primary text-white"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
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
                <Link to="/admin/appeal">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <FaFile size={25} />
                    Appeal
                  </li>
                </Link>
                <Link to="/admin/reports">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdOutlineReport size={25} />
                    Reports
                  </li>
                </Link>
                <li
                  onClick={handleLogoutConfirmation}
                  className="hover:bg-red-600 hover:text-white text-black p-4 text-xs flex gap-2 items-center"
                >
                  <AiOutlineLogout size={25} />
                  <button>Log-out</button>
                </li>
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
                        <div>
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

                          <td className="p-1 flex gap-2 w-full">
                            <button
                              className="font-normal md:btn-sm btn-xs w-full btn btn-primary text-white"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`,
                                  "_blank"
                                )
                              }
                            >
                              Get Direction
                            </button>
                            <button
                              className="font-normal md:btn-sm btn-xs w-full btn btn-danger text-white"
                              onClick={() => handleDelete(selectedLocation.id)} // Assuming handleDelete function is implemented to handle product deletion
                            >
                              Delete Product
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

export default AdminLocations;
