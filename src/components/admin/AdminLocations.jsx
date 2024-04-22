import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  getDoc,
  onSnapshot,
  doc,
  updateDoc,
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
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminLocations = () => {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "products"),
      (querySnapshot) => {
        const locationsData = [];
        querySnapshot.forEach(async (doc) => {
          const product = doc.data();
          if (
            product.location &&
            product.location.latitude &&
            product.location.longitude &&
            product.address
          ) {
            // Fetch user details from registered collection
            const registeredDoc = await getDoc(
              doc(firestore, "registered", product.userId)
            );
            const registered = registeredDoc.data();
            if (registered) {
              locationsData.push({
                id: doc.id,
                latitude: product.location.latitude,
                longitude: product.location.longitude,
                firstName: registered.firstName,
                lastName: registered.lastName,
                address: product.address,
              });
            }
          }
        });
        console.log("Locations Data:", locationsData);
        setLocations(locationsData);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);
  const defaultCenter = {
    lat: 14.4576,
    lng: 120.9429,
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

  const toggleProductVisibility = async () => {
    const productId = selectedLocation.id;
    const isHidden = selectedLocation.isHidden;
    try {
      if (isHidden) {
        // Product is hidden, show confirm dialog to show it
        const confirmationResult = await Swal.fire({
          title: "Show Product",
          text: "Are you sure you want to show this product?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        });

        if (confirmationResult.isConfirmed) {
          const productDocRef = doc(firestore, "products", productId);
          await updateDoc(productDocRef, {
            isHidden: false,
            hideReason: null, // Clear the hide reason when showing the product
          });
          // Update local state to reflect the change
          setLocations((prevProducts) =>
            prevProducts.map((product) =>
              product.id === productId
                ? { ...product, isHidden: false, hideReason: null }
                : product
            )
          );
          Swal.fire("Success!", `Product has been shown.`, "success");
        }
        return;
      }

      // Product is visible, show input options to hide it
      const { value: reason } = await Swal.fire({
        title: "Hide Product",
        input: "select",
        inputLabel: "Select a reason",
        inputOptions: {
          "Inappropriate Content": "Inappropriate Content",
          "Spam or Scams": "Spam or Scams",
          "Copyright Infringement": "Copyright Infringement",
          "False Information": "False Information",
          "Violations of Website Policies": "Violations of Website Policies",
          "Privacy Concerns": "Privacy Concerns",
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonText: "Hide",
        confirmButtonColor: "#d33",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          return !value && "You need to select a reason!";
        },
      });

      if (reason) {
        const productDocRef = doc(firestore, "products", productId);
        await updateDoc(productDocRef, {
          isHidden: true,
          hideReason: reason, // Store the hide reason in Firestore
        });
        // Update local state to reflect the change
        setLocations((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? { ...product, isHidden: true, hideReason: reason }
              : product
          )
        );
        Swal.fire("Success!", `Product has been hidden.`, "success");
      }
    } catch (error) {
      console.error("Error updating product visibility:", error);
      Swal.fire(
        "Error!",
        "An error occurred while updating product visibility.",
        "error"
      );
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
              deletions="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">
                  Admin Panel
                </h1>{" "}
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
                <Link to="/admin/delete/user">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <RiDeleteBin6Line size={25} />
                    Deletion Requests
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
                            {selectedLocation.isHidden ? (
                              <button
                                className="font-normal md:btn-sm btn-xs w-full btn btn-success text-white"
                                onClick={toggleProductVisibility}
                              >
                                Show Product
                              </button>
                            ) : (
                              <button
                                className="font-normal md:btn-sm btn-xs w-full btn btn-danger text-white"
                                onClick={toggleProductVisibility}
                              >
                                Hide Product
                              </button>
                            )}
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
