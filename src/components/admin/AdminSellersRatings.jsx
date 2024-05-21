import React, { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import uploadload from "../../assets/loading.gif";
import { AiOutlineLogout } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  MdNoAccounts,
  MdOutlineReport,
  MdOutlineRestaurantMenu,
} from "react-icons/md";
import { FaFile, FaUsers } from "react-icons/fa";
import { GiMussel } from "react-icons/gi";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAuth, signOut } from "firebase/auth";
import NavbarAdmin from "./NavbarAdmin";
import logo from "../../assets/logo.png";
import { firestore } from "../../firebase";
import { FaStar } from "react-icons/fa";

const AdminSellersRatings = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellersRatings = async () => {
      try {
        const sellersRef = collection(firestore, "registered");
        const reviewsRef = collection(firestore, "reviews");

        const sellersSnapshot = await getDocs(
          query(sellersRef, where("role", "==", "Seller"))
        );

        const sellersData = await Promise.all(
          sellersSnapshot.docs.map(async (sellerDoc) => {
            const sellerData = sellerDoc.data();

            const reviewsSnapshot = await getDocs(
              query(reviewsRef, where("userId", "==", sellerDoc.id))
            );

            const totalReviews = reviewsSnapshot.size;
            const totalRating = reviewsSnapshot.docs.reduce(
              (sum, reviewDoc) => sum + parseFloat(reviewDoc.data().rating),
              0
            );

            const averageRating =
              totalReviews > 0 ? totalRating / totalReviews : 0;

            return {
              ...sellerData,
              averageRating,
              totalReviews,
            };
          })
        );

        const sortedSellers = sellersData.sort(
          (a, b) => b.averageRating - a.averageRating
        );

        setSellers(sortedSellers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sellers ratings:", error);
        setLoading(false);
      }
    };

    fetchSellersRatings();
  }, []);

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
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
              deletions="bg-white text-primary"
              accinfos="bg-white text-primary"
              ratings="bg-primary text-white"
            />
          </div>
          <div className="md:flex md:flex-row">
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
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <LiaSearchLocationSolid size={25} className="" />
                    Locations
                  </li>
                </Link>
                <Link to="/admin/products">
                  <li className="hover:bg-primary hover:text-white text-primary p-4 text-xs flex gap-2 items-center">
                    <GiMussel size={25} className="" />
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
                <Link to="/admin/sellers/ratings">
                  <li className="bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <FaStar size={25} />
                    Sellers Ratings
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

            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl pt-10 font-bold mb-4">Seller Ratings</h1>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellers
                    .filter(
                      (seller) =>
                        seller.firstName &&
                        seller.email !== "bacoorogmarket@gmail.com"
                    )
                    .map((seller) => (
                      <div
                        key={seller.userId}
                        className="bg-white p-4 rounded shadow"
                      >
                        <div className="flex items-center">
                          <img
                            src={seller.profilePhotoUrl}
                            alt={`${seller.firstName} ${seller.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <p className="text-lg font-semibold">
                              {seller.firstName} {seller.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {seller.totalReviews} Reviews
                            </p>
                            <div className="flex items-center">
                              <FaStar className="text-yellow-500" />
                              <p className="ml-1">
                                {seller.averageRating.toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellersRatings;
