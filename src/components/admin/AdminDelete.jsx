import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
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
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";

import Swal from "sweetalert2";
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminDelete = () => {
  const [loading, setLoading] = useState(true);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(true);
  const navigate = useNavigate();
  const [deletionHistory, setDeletionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDeletionHistory = async () => {
      try {
        const db = getFirestore();
        const deleteSurveysRef = collection(db, "deleteSurveys");
        const snapshot = await getDocs(deleteSurveysRef);
        const deletionHistoryData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            if (doc.id !== "sample") {
              const userHistoryData = await getUserData(doc.data().userId);
              return {
                id: doc.id,
                explanation: doc.data().explanation,
                reason: doc.data().reason,
                userHistoryData: userHistoryData,
              };
            }
            return null;
          })
        );
        setDeletionHistory(
          deletionHistoryData.filter((history) => history !== null)
        );
        setLoadingHistory(false);
      } catch (error) {
        console.error("Error fetching deletion history:", error);
      }
    };

    fetchDeletionHistory();
  }, []);

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const db = getFirestore();
        const deletionRequestRef = collection(db, "accountDeleteReasons");
        const snapshot = await getDocs(deletionRequestRef);
        const deletionRequestData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            if (doc.id !== "sample") {
              const userData = await getUserData(doc.data().userId);
              return {
                id: doc.id,
                explanation: doc.data().explanation,
                reason: doc.data().reason,
                userData: userData,
              };
            }
            return null;
          })
        );
        setDeletionRequests(
          deletionRequestData.filter(
            (deletionRequest) => deletionRequest !== null
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching deletionRequests:", error);
      }
    };

    fetchAppeals();
  }, []);

  const getUserData = async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "registered", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("No such user document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

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

  const handleDeleteConfirmation = (userId, firstName) => {
    Swal.fire({
      title: `Give ${firstName} access?`,
      text: `Are you sure you want ${firstName} to have access in account deletion?`,
      input: "text",
      inputPlaceholder: "Type 'Confirm' to proceed",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, grant access",
      inputValidator: (value) => {
        if (value !== "Confirm") {
          return "Please type 'Confirm' to proceed";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAccount(userId);
      }
    });
  };

  const deleteAccount = async (userId, explanation, reason) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, "registered", userId);
      await updateDoc(userRef, { deleteAccount: true });
      const accountDeleteReasonsRef = doc(db, "accountDeleteReasons", userId);
      const accountDeleteReasonsSnapshot = await getDoc(
        accountDeleteReasonsRef
      );
      const { explanation, reason } = accountDeleteReasonsSnapshot.data();

      const deleteSurveysCollectionRef = collection(db, "deleteSurveys");
      const newDeleteSurveyDocRef = doc(deleteSurveysCollectionRef);
      await setDoc(newDeleteSurveyDocRef, { userId, explanation, reason });
      await deleteReason(userId);
      Swal.fire("Success", "Account deletion request submitted", "success");
      window.location.reload();
    } catch (error) {
      console.error("Error updating account:", error);
      Swal.fire("Error", "Failed to submit account deletion request", "error");
    }
  };

  const deleteReason = async (userId) => {
    try {
      const db = getFirestore();
      const reasonRef = doc(db, "accountDeleteReasons", userId);
      await deleteDoc(reasonRef);
    } catch (error) {
      console.error("Error deleting reason:", error);
    }
  };

  const toggleView = () => {
    setShowRequests((prev) => !prev);
  };

  // Search function
  const filteredRequests = deletionRequests.filter((request) => {
    const fullName = `${request.userData.firstName} ${request.userData.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredHistory = deletionHistory.filter((historyItem) => {
    const fullName = `${historyItem.userHistoryData.firstName} ${historyItem.userHistoryData.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
              users="bg-white text-primary"
              locations="bg-white text-primary"
              products="bg-white text-primary"
              recipes="bg-white text-primary"
              appeals="bg-white text-primary"
              reports="bg-white text-primary"
              deletions="bg-primary text-white "
              accinfos="bg-white text-primary"
            />
          </div>
          <div className="md:flex md:flex-row">
            <div className="md:w-1/5 fixed lg:w-1/5 hidden md:block h-screen bg-gray-200">
              <div className="pt-4 flex flex-col justify-center items-center gap-3">
                <img className="h-20 mx-auto" src={logo} alt="" />
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-2">
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
                  <li className=" bg-primary p-4 text-white text-xs flex gap-2 items-center">
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

            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <div className="flex justify-center md:justify-end items-center gap-2 pt-1 mb-4">
                <h1 className="text-xs">Reasons and Explanations</h1>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md bg-base-100 text-sm focus:outline-none focus:border-blue-500"
                  value={showRequests ? "deletionRequest" : "deletionRE"}
                  onChange={toggleView}
                >
                  <option value="deletionRequest">Deletion Requests</option>
                  <option value="deletionRE">Granted Access</option>
                </select>
              </div>
              {/* Search Input */}
              <div className="border-primary  border w-full mb-4 px-2 flex items-center gap-2 rounded-md ">
                <FaSearch size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                {" "}
                <h1 className="text-center mb-2 font-bold text-2xl">
                  Deletion Requests
                </h1>
              </div>
              <ul className="mt-4">
                {showRequests ? (
                  filteredRequests.length === 0 ? (
                    <div className="flex w-full items-center flex-col justify-center mt-4">
                      <p className="text-xl md:text-2xl ml-4">
                        There are no account deletion requests
                      </p>
                    </div>
                  ) : (
                    filteredRequests.map((deletionRequest) => (
                      <div>
                        <li
                          key={deletionRequest.id}
                          className="card glass rounded-lg mb-2 p-3"
                        >
                          <div className="flex justify-between items-center">
                            {deletionRequest.userData && (
                              <div className="flex text-xs md:text-base items-center gap-2">
                                <img
                                  src={deletionRequest.userData.profilePhotoUrl}
                                  alt="Profile"
                                  className="md:w-14 md:h-14  w-10 h-10 border border-primary rounded-full object-cover inline-block ml-2"
                                />{" "}
                                {deletionRequest.userData.firstName}{" "}
                                {deletionRequest.userData.lastName}
                              </div>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteConfirmation(
                                  deletionRequest.userData.userId,
                                  deletionRequest.userData.firstName
                                )
                              }
                              className="btn btn-error btn-xs md:btn-md text-white"
                            >
                              Give Access
                            </button>
                          </div>
                          <div className="text-xs sm:text-sm md:text-base">
                            <div>
                              <strong>Reason:</strong> {deletionRequest.reason}
                            </div>
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {deletionRequest.explanation}
                            </div>
                          </div>
                        </li>
                      </div>
                    ))
                  )
                ) : (
                  <div>
                    <ul className="mt-2">
                      {loadingHistory ? (
                        <div>Loading history...</div>
                      ) : filteredHistory.length === 0 ? (
                        <div className="flex w-full items-center flex-col justify-center mt-4">
                          <p className="text-xl md:text-2xl ml-4">
                            There is no deletion history.
                          </p>
                        </div>
                      ) : (
                        filteredHistory.map((historyItem) => (
                          <li
                            key={historyItem.id}
                            className="card glass rounded-lg mb-2 p-3"
                          >
                            <div className="flex justify-between items-center">
                              {historyItem.userHistoryData && (
                                <div className="flex text-xs md:text-base items-center gap-2">
                                  <img
                                    src={
                                      historyItem.userHistoryData
                                        .profilePhotoUrl
                                    }
                                    alt="Profile"
                                    className="md:w-14 md:h-14  w-10 h-10 border border-primary rounded-full object-cover inline-block ml-2"
                                  />{" "}
                                  {historyItem.userHistoryData.firstName}{" "}
                                  {historyItem.userHistoryData.lastName}
                                </div>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm md:text-base">
                              <div>
                                <strong>Reason:</strong> {historyItem.reason}
                              </div>
                              <div>
                                <strong>Explanation:</strong>{" "}
                                {historyItem.explanation}
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDelete;
