import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import markerIcon from "../../assets/marker.png";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";
import uploadload from "../../assets/loading.gif";
import { IoIosWarning, IoMdCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";
import { FaClipboardCheck } from "react-icons/fa6";

const libraries = ["places"];
const ProductInfo = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(firestore, "products", productId);
        const productSnapshot = await getDoc(productRef);
        if (productSnapshot.exists()) {
          const fetchedProduct = productSnapshot.data();

          fetchedProduct.id = productSnapshot.id;

          const userDocRef = doc(
            firestore,
            "registered",
            fetchedProduct.userUid
          );
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.data();

          fetchedProduct.firstName = userData.firstName;
          fetchedProduct.lastName = userData.lastName;
          fetchedProduct.profilePhotoUrl = userData.profilePhotoUrl;

          setProduct(fetchedProduct);
        } else {
          console.log("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  const goBack = () => {
    navigate(-1);
  };

  const handleSlideshowChange = (direction) => {
    const lastIndex = product.photos.length - 1;
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

  const productLocation = product
    ? { lat: product.location.latitude, lng: product.location.longitude }
    : null;

  const handleMapClick = () => {
    if (productLocation) {
      const { latitude, longitude } = product.location;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank"
      );
    }
  };

  const handleMessageSelect = async () => {
    try {
      const chatId = [auth.currentUser.uid, product.userUid].sort().join("");
      const chatDocRef = doc(firestore, "chats", chatId);

      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        await setDoc(chatDocRef, {
          users: [auth.currentUser.uid, product.userUid],
          messages: [],
        });
      }

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const handleViewPhoto = () => {
    Swal.fire({
      imageUrl: product.photos[slideshowIndex],
      imageAlt: `Product-Photos ${slideshowIndex + 1}`,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        image: "custom-class-name",
        closeButton: "btn btn-error btn-circle text-white",
      },
    });
  };
  const handleDeleteProduct = async () => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You will not be able to recover this product!",
        icon: "warning",
        showCancelButton: true,

        confirmButtonColor: "#008080",
        confirmButtonText: "Yes, delete it!",
      });

      if (isConfirmed) {
        const productRef = doc(firestore, "products", productId);
        await deleteDoc(productRef);

        Swal.fire("Deleted!", "Your product has been deleted.", "success");

        navigate("/marketplace");
      }
    } catch (error) {
      console.error("Error deleting product:", error);

      Swal.fire(
        "Error!",
        "An error occurred while deleting the product.",
        "error"
      );
    }
  };

  const handleReportPost = async () => {
    try {
      const reportsRef = collection(firestore, "productReports");
      const q = query(
        reportsRef,
        where("productId", "==", productId),
        where("reporterId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Swal.fire(
          "Already Reported",
          "You have already reported this product.",
          "info"
        );
        return;
      }

      const { value: reason, value: explanation } = await Swal.fire({
        title: `Why do you want to report ${product.firstName}'s post?`,
        input: "select",
        inputOptions: {
          "Inappropriate Content": "Inappropriate Content",
          "Spam or Scams": "Spam or Scams",
          "Copyright Infringement": "Copyright Infringement",
          "False Information": "False Information",
          "Violations of Website Policies": "Violations of Website Policies",
          "Privacy Concerns": "Privacy Concerns",
          Others: "Others",
        },
        inputValidator: (value) => {
          if (!value) {
            return "You need to select a reason";
          }
        },
        inputPlaceholder: "Select a reason",
        inputAttributes: {
          autocapitalize: "off",
          style: "border: 1px solid #ccc; border-radius: 5px; padding: 5px;",
        },
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#008080",
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        html: '<textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Explain why"></textarea>',
        preConfirm: () => {
          const explanationValue =
            Swal.getPopup().querySelector("#swal-input2").value;
          if (!explanationValue) {
            Swal.showValidationMessage("You need to provide an explanation");
          } else {
            const reasonValue =
              Swal.getPopup().querySelector(".swal2-select").value;

            const reportData = {
              reason: reasonValue,
              explanation: explanationValue,
              productId: productId,
              userId: product.userUid,
              reporterId: auth.currentUser.uid,
              timestamp: serverTimestamp(),
            };
            addDoc(collection(firestore, "productReports"), reportData);
            Swal.fire({
              title: "Report Submitted!",
              text: "Thank you for your report. Our team will review it.",
              icon: "success",
            });
          }
        },
      });

      if (reason && explanation) {
        // This block will never be executed because the preConfirm function handles the submission
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      Swal.fire(
        "Error!",
        "An error occurred while reporting the post.",
        "error"
      );
    }
  };

  const handleMarkAsSold = async () => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: `Do you want ${product.caption} to be marked as sold?`,
        text: "The product will no longer be available on the marketplace.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#008080",
        confirmButtonText: "Yes, mark as sold!",
      });

      if (isConfirmed) {
        const userRef = doc(firestore, "registered", auth.currentUser.uid);
        const productRef = doc(firestore, "products", productId);

        await updateDoc(userRef, {
          soldProduct: increment(1),
        });

        await updateDoc(productRef, {
          isSold: true,
        });

        Swal.fire(
          "Marked as Sold!",
          `${product.caption} has been marked as sold.`,
          "success"
        );
        navigate("/marketplace");
      }
    } catch (error) {
      console.error("Error marking product as sold:", error);
      Swal.fire(
        "Error!",
        "An error occurred while marking the product as sold.",
        "error"
      );
    }
  };
  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <img
          className="lg:h-32 h-20 md:h-28 object-contain mx-auto"
          src={uploadload}
          alt="Loading..."
        />
      </div>
    );
  }

  const isSeller = auth.currentUser && auth.currentUser.uid === product.userUid;

  return (
    <div className="w-full mx-auto pb-10 md:pb-5 p-5">
      <div className="flex justify-between items-center border-b border-solid pb-5 mb-5">
        <div className="flex items-center">
          <img
            src={product.profilePhotoUrl}
            alt="ProfilePhoto"
            className="w-8 h-8 md:w-16 md:h-16 rounded-full object-cover inline-block"
          />
          <div className="ml-4">
            <p className="text-primary text-xs sm:text-sm font-semibold">
              {`${product.firstName} ${product.lastName}`}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {product.timestamp}
            </p>
            {isSeller ? (
              <div className="flex items-center gap-2">
                {!product.isSold && (
                  <div>
                    <Link
                      className="btn btn-xs text-xs btn-primary"
                      to={`/edit_product/${product.id}`}
                    >
                      Edit
                    </Link>
                  </div>
                )}
                <div>
                  <button
                    onClick={handleDeleteProduct}
                    className="btn text-white  btn-xs text-xs btn-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${product.userUid}`}
                  className="btn btn-xs text-xs btn-primary"
                >
                  View Profile
                </Link>
                <button
                  onClick={handleReportPost}
                  className="btn btn-xs text-xs btn-error text-white"
                >
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <button
            className=" text-black md:hidden text-2xl font-semibold focus:outline-none"
            onClick={goBack}
          >
            <IoMdCloseCircle size={30} className="text-red-500" />
          </button>
          <button
            className="hidden md:block btn btn-primary text-white"
            onClick={goBack}
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/2">
          {product.isSold ? (
            <div>
              <h1 className="flex items-center font-bold  gap-1 justify-center ">
                <FaClipboardCheck className="text-primary" />
                This product was Sold
              </h1>
            </div>
          ) : null}
          <div className="mb-4">
            {product.photos && product.photos.length > 0 && (
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-64 sm:w-96 md:w-[340px] lg:w-[500px] object-cover relative">
                    <div onClick={handleViewPhoto}>
                      <img
                        src={product.photos[slideshowIndex]}
                        alt={`Product-Photos ${slideshowIndex + 1}`}
                        className="w-full h-full absolute inset-0 z-0 opacity-60 blur-sm object-cover rounded-lg"
                      />
                      <img
                        src={product.photos[slideshowIndex]}
                        alt={`Product-Photos ${slideshowIndex + 1}`}
                        className="w-full max-w-md mx-auto h-56 sm:h-64 p-1 lg:h-72 object-contain rounded-lg relative z-10"
                      />
                      <h1 className="text-center underline text-xs md:text-base">
                        Click the photo to view in full-screen
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-20 pb-5 w-full">
                  <button
                    onClick={() => handleSlideshowChange("prev")}
                    className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                      product.photos && product.photos.length > 1
                        ? "btn-primary"
                        : "btn-disabled cursor-not-allowed"
                    }`}
                    disabled={product.photos && product.photos.length <= 1}
                  >
                    <BiSolidSkipPreviousCircle size={30} />
                  </button>
                  <button
                    onClick={() => handleSlideshowChange("next")}
                    className={`text-white btn btn-sm text-3xl md:text-4xl  md:btn-md btn-circle ${
                      product.photos && product.photos.length > 1
                        ? "btn-primary"
                        : "btn-disabled cursor-not-allowed"
                    }`}
                    disabled={product.photos && product.photos.length <= 1}
                  >
                    <BiSolidSkipNextCircle size={30} />
                  </button>
                </div>
              </div>
            )}
          </div>
          {isSeller && !product.isSold ? (
            <div className="flex justify-center items-center w-full">
              <div>
                <button
                  onClick={handleMarkAsSold}
                  className="btn btn-primary w-full text-white btn-xs"
                >
                  Mark as Sold
                </button>
              </div>
            </div>
          ) : null}
          {product.isSold ? (
            <div>
              <h1 className="flex items-center italic text-error gap-1 justify-center ">
                <IoIosWarning />
                You can only see this post.
              </h1>
            </div>
          ) : null}
          <div className="flex justify-between px-5 items-center">
            <div className="mt-2 w-[600px] ">
              <h1 className="font-bold text-lg sm:text-xl text-primary mb-1">
                {product.caption}
              </h1>
              <p className="text-xs sm:text-base mb-1">
                <span className="text-primary font-bold">Price:</span> ₱
                {product.price.toLocaleString()}
                .00
              </p>
              <div className="hidden md:block">
                {product.otherInformation ? (
                  <div>
                    <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                      Other Information:
                    </h2>
                    <h2 className="text-xs sm:text-base mb-1">
                      {product.otherInformation}
                    </h2>
                  </div>
                ) : (
                  <div className="hidden md:block">
                    <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                      Other Information:
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-base mb-1">
                      No other information
                    </p>
                  </div>
                )}
              </div>
              <div className="md:hidden my-2 w-full border"></div>
              <div className="md:hidden">
                <p className="text-primary text-xs sm:text-lg font-bold">
                  Description:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-base mb-1">
                  {product.description}
                </p>
              </div>
              <div className="md:hidden">
                <p className="text-primary text-xs sm:text-lg font-bold">
                  Address:{" "}
                </p>
                <p className=" text-xs  md:text-start sm:text-base">
                  {product.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:block hidden h-full border"></div>

        <div className="md:w-1/2 w-full">
          <div className="md:block hidden">
            <p className="text-primary text-xs sm:text-lg font-bold">
              Description:{" "}
            </p>
            <p className=" text-xs  md:text-start sm:text-base mb-1">
              {product.description}
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-primary text-xs sm:text-lg  font-bold">
              Address:{" "}
            </p>
            <p className=" text-xs  md:text-start sm:text-base">
              {product.address}
            </p>
          </div>
          <div className="mx-auto justify-center mb-5 h-40 md:h-80 w-full md:w-80 lg:w-full object-cover cursor-pointer mt-1 px-7">
            <h1
              onClick={handleMapClick}
              className="text-center text-xs lg:text-base text-primary "
            >
              Click the Map to locate the Seller
            </h1>
            {product.location ? (
              <div className="mx-auto mb-5 h-40 md:h-72 w-full md:w-72 lg:w-96 cursor-pointer shadow-sm shadow-primary rounded-lg p-1">
                <LoadScript
                  googleMapsApiKey="AIzaSyBLZJ-nDBC4jlEDsMb7qS3kjuJp90fTPbM"
                  libraries={libraries}
                >
                  <GoogleMap
                    mapContainerStyle={{ height: "100%", width: "100%" }}
                    center={productLocation}
                    zoom={16}
                    options={{
                      draggable: false,
                      zoomControl: false,
                      gestureHandling: "none",
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                      borderRadius: "8px",
                    }}
                    onClick={handleMapClick}
                  >
                    <CustomOverlay
                      position={productLocation}
                      onClick={handleMapClick}
                    />
                  </GoogleMap>
                </LoadScript>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">
                  Location:
                </h2>
                <p className="text-gray-500">No location data available.</p>
              </div>
            )}
          </div>
          <div className="px-3 md:hidden">
            {product.otherInformation ? (
              <div>
                <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                  Other Information:
                </h2>
                <h2 className="text-xs sm:text-base mb-1">
                  {product.otherInformation}
                </h2>
              </div>
            ) : (
              <div className="px-3 md:hidden">
                <h2 className="text-xs font-bold sm:text-base mb-1 text-primary">
                  Other Information:
                </h2>
                <p className="text-gray-500 text-xs sm:text-base mb-1">
                  No other information
                </p>
              </div>
            )}
          </div>
          {isSeller ? null : (
            <div className="flex flex-col justify-center mt-1">
              <h1 className="text-lg text-center w-full font-bold pb-2">
                Want to talk to {product.firstName}?
              </h1>

              <div className="flex justify-center">
                <button
                  onClick={handleMessageSelect}
                  className="btn-sm md:btn-xs lg:btn-sm btn btn-primary"
                >
                  Message {product.firstName} now!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomOverlay = ({ position }) => {
  const overlayStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -85%)",
  };

  return (
    <div style={overlayStyle}>
      <img
        src={markerIcon}
        alt="Marker"
        className="h-10 w-10 object-contain bg-transparent"
      />
    </div>
  );
};

export default ProductInfo;
