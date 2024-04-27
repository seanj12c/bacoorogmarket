import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import { FaFile, FaSearch, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import {
  MdNoAccounts,
  MdOutlineReport,
  MdOutlineRestaurantMenu,
} from "react-icons/md";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const productsCollection = collection(firestore, "products");
        const productsQuery = query(productsCollection);
        const querySnapshot = await getDocs(productsQuery);
        const locationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(locationsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLoading(false);
      }
    };

    fetchLocations();
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

  const toggleProductVisibility = async (productId, isHidden) => {
    try {
      const productDocRef = doc(firestore, "products", productId);
      const productSnapshot = await getDoc(productDocRef);
      const productData = productSnapshot.data();

      if (!productData) {
        console.error("Product not found");
        return;
      }

      const updatedIsHidden = !productData.isHidden;

      if (!updatedIsHidden) {
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
          setSelectedLocation(null);
        }
      } else {
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
          setSelectedLocation(null);
        }
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

  console.log("Locations:", locations);

  console.log(
    "Locations Latitude:",
    locations.map((location) => location.location.latitude)
  );

  const openModal = (location) => {
    const modal = document.getElementById("my_modal_3");
    const title = modal.querySelector(".modal-box h3");
    const details = modal.querySelector(".modal-box p");

    let productDetails = `<div class="text-left">`;
    productDetails += `<p><span class="font-bold">Name:</span> ${location.caption}</p>`;
    productDetails += `<p><span class="font-bold">Name:</span> ${location.firstName} ${location.lastName}</p>`;
    productDetails += `<p><span class="font-bold">Address:</span> ${location.address}</p>`;
    productDetails += `<p><span class="font-bold">Product Description:</span> ${location.description}</p>`;
    productDetails += `<p><span class="font-bold">Date Posted:</span> ${location.timestamp}</p>`;
    productDetails += `<p><span class="font-bold">Price: ₱</span>${location.price}.00</p>`;

    // Check if otherInformation is available
    if (location.otherInformation) {
      productDetails += `<p><span class="font-bold">Other Information:</span> ${location.otherInformation}</p>`;
    } else {
      productDetails +=
        "<p><span class='font-bold'>Other Information:</span> <span class='italic'>No other information provided</span></p>";
    }

    // Display photos
    if (location.photos && location.photos.length > 0) {
      productDetails +=
        "<div class='pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 xl:grid-cols-3'>";
      location.photos.forEach((photo, index) => {
        productDetails += `<img src="${photo}" alt="Product Photo ${
          index + 1
        }" class="w-full h-60 object-cover rounded-lg" />\n`;
      });
      productDetails += "</div>";
    }

    // Display timestamp

    productDetails += `</div>`;

    // Update modal content with product details
    title.innerText = "Product Details";
    details.innerHTML = productDetails;

    // Show modal
    modal.showModal();
  };

  const closeModal = () => {
    const modal = document.getElementById("my_modal_3");
    modal.close();
  };

  const filteredLocations = locations.filter((location) => {
    const fullName = `${location.firstName} ${location.lastName}`;
    return (
      location.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
              accinfos="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
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
                <Link to="/admin/delete/info">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <MdNoAccounts size={25} />
                    Deleted Acc Info
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
                    center={{
                      lat: parseFloat(defaultCenter.lat),
                      lng: parseFloat(defaultCenter.lng),
                    }}
                    zoom={12}
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,

                      borderRadius: "8px",
                    }}
                  >
                    {filteredLocations.map((location) => (
                      <Marker
                        key={location.id}
                        position={{
                          lat: parseFloat(location.location.latitude),
                          lng: parseFloat(location.location.longitude),
                        }}
                        onClick={() => {
                          setSelectedLocation(location);
                        }}
                      />
                    ))}

                    {selectedLocation && (
                      <InfoWindow
                        position={{
                          lat: parseFloat(selectedLocation.location.latitude),
                          lng: parseFloat(selectedLocation.location.longitude),
                        }}
                        onCloseClick={() => {
                          setSelectedLocation(null);
                        }}
                      >
                        <div className="pb-2 pr-2 flex items-center justify-center mx-auto">
                          <h2 className="text-center">{`${selectedLocation.firstName} ${selectedLocation.lastName}`}</h2>
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
                    : "Please tap the marker on the map to display specific user"}
                </h1>

                <div className="border-primary mb-4  border w-full  px-2 flex items-center gap-2 rounded-md ">
                  <FaSearch size={20} className="text-primary" />
                  <input
                    type="text"
                    placeholder="Search by name or address to display in table"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  />
                </div>
                <div className="overflow-auto">
                  <table className="w-full table table-xs text-xs text-center bg-gray-200 border border-gray-300">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="p-1 border border-gray-300">Name</th>
                        <th className="p-1 border border-gray-300">Address</th>
                        <th className="p-1 border border-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <dialog id="my_modal_3" className="modal">
                        <div className="modal-box">
                          <form method="dialog">
                            <button
                              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                              onClick={closeModal}
                            >
                              ✕
                            </button>
                          </form>
                          <h3 className="font-bold text-lg" id="modalTitle">
                            Product Title
                          </h3>
                          <p className="py-4" id="modalDetails">
                            Product Details Here.
                          </p>
                        </div>
                      </dialog>
                      {selectedLocation ? (
                        <tr>
                          <td className="p-1 border border-gray-300">
                            {selectedLocation.firstName}{" "}
                            {selectedLocation.lastName}
                          </td>
                          <td className="p-1 border border-gray-300">
                            {selectedLocation.address}
                          </td>
                          <td className="flex flex-col gap-2">
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
                                onClick={() =>
                                  toggleProductVisibility(selectedLocation.id)
                                }
                              >
                                Show Product
                              </button>
                            ) : (
                              <button
                                className="font-normal md:btn-sm btn-xs w-full btn btn-error text-white"
                                onClick={() =>
                                  toggleProductVisibility(selectedLocation.id)
                                }
                              >
                                Hide Product
                              </button>
                            )}
                            <button
                              className="font-normal md:btn-sm btn-xs w-full btn btn-success text-white"
                              onClick={() => openModal(selectedLocation)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ) : (
                        // If no location is selected, display all products
                        filteredLocations.map((location) => (
                          <tr key={location.id}>
                            <td className="p-1 border border-gray-300">
                              {location.firstName} {location.lastName}
                            </td>
                            <td className="p-1 border border-gray-300">
                              {location.address}
                            </td>
                            <td className="flex flex-col gap-2">
                              <button
                                className="font-normal md:btn-sm btn-xs w-full btn btn-primary text-white"
                                onClick={() =>
                                  window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
                                    "_blank"
                                  )
                                }
                              >
                                Get Direction
                              </button>
                              {location.isHidden ? (
                                <button
                                  className="font-normal md:btn-sm btn-xs w-full btn btn-success text-white"
                                  onClick={() =>
                                    toggleProductVisibility(location.id)
                                  }
                                >
                                  Show Product
                                </button>
                              ) : (
                                <button
                                  className="font-normal md:btn-sm btn-xs w-full btn btn-error text-white"
                                  onClick={() =>
                                    toggleProductVisibility(location.id)
                                  }
                                >
                                  Hide Product
                                </button>
                              )}
                              {/* You can open the modal using document.getElementById('ID').showModal() method */}
                              <button
                                className="font-normal md:btn-sm btn-xs w-full btn btn-success text-white"
                                onClick={() => openModal(location)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
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
