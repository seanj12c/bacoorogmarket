import React, { useEffect, useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import uploadload from "../../assets/loading.gif";
import Swal from "sweetalert2"; // Import SweetAlert
import { setDoc } from "firebase/firestore";
import { FaFile, FaSearch, FaUsers } from "react-icons/fa";
import { LiaSearchLocationSolid } from "react-icons/lia";
import { GiMussel } from "react-icons/gi";
import { MdOutlineReport, MdOutlineRestaurantMenu } from "react-icons/md";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AiOutlineLogout } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const usersCollection = collection(firestore, "registered");
    const usersQuery = query(usersCollection, orderBy("userId", "desc"));

    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if the user ID and email match the specific values to be filtered out
        if (
          data.userId !== "z3YwfbkrJiWPGOW8U8on8kUMYlO2" &&
          data.email !== "bacoorogmarket@gmail.com"
        ) {
          usersData.push({
            id: doc.id,
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            disabled: data.disabled || false,
            profilePhotoUrl: data.profilePhotoUrl,
            contact: data.contact,
            address: data.address,
          });
        }
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const enableAccount = async (user) => {
    const result = await Swal.fire({
      title: `Are you sure you want to ENABLE ${user.firstName} ${user.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Enable",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#67BA6A",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      const userRef = doc(firestore, "registered", user.id);

      // Remove the reason document from the disabledReason collection
      const reasonRef = doc(firestore, "disabledReason", user.userId);
      await deleteDoc(reasonRef);

      const appealQuery = query(
        collection(firestore, "userAppeal"),
        where("userId", "==", user.userId)
      );
      const appealSnapshot = await getDocs(appealQuery);
      appealSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      // Update the user's disabled status
      await updateDoc(userRef, {
        disabled: false,
      });

      Swal.fire("Enabled!", `User ${user.firstName} enabled.`, "success");
    }
  };

  const disableAccount = async (user) => {
    try {
      const { value: reason } = await Swal.fire({
        title: `Why do you want to disable ${user.firstName}'s account?`,
        input: "select",
        inputOptions: {
          "Posting Inappropriate Content": "Posting Inappropriate Content",
          "Identity Theft": "Identity Theft",
          "Inappropriate Display Picture": "Inappropriate Display Picture",
          "Harassment or Bullying": "Harassment or Bullying",
          Spam: "Spam",
          "Scamming/Bogus Buyer": "Scamming/Bogus Buyer",
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
        html: `
          <textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Explain why"></textarea>
        `,
        preConfirm: async () => {
          const reason = Swal.getPopup().querySelector(".swal2-select").value;
          const explanation =
            Swal.getPopup().querySelector("#swal-input2").value;

          if (!reason || !explanation) {
            Swal.showValidationMessage("Please fill out all fields");
            return;
          }

          try {
            const reportData = {
              reason,
              explanation,
              userId: user.userId,
            };
            const userRef = doc(firestore, "registered", user.id);
            await updateDoc(userRef, { disabled: true });
            const reasonRef = doc(firestore, "disabledReason", user.id);

            await setDoc(reasonRef, reportData);

            Swal.fire({
              title: "Report Submitted!",
              text: `${user.firstName}'s account has been disabled.`,
              icon: "success",
            });
          } catch (error) {
            console.error("Error reporting profile:", error);
            Swal.fire(
              "Error!",
              "An error occurred while disabling the account.",
              "error"
            );
          }
        },
      });

      if (!reason) {
        Swal.fire({
          title: "Cancelled",
          text: "Disabling the account has been cancelled.",
          icon: "error",
          confirmButtonColor: "#008080",
        });
      }
    } catch (error) {
      console.error("Error reporting profile:", error);
      Swal.fire(
        "Error!",
        "An error occurred while disabling the account.",
        "error"
      );
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    return (
      (user.userId?.toLowerCase()?.includes(searchQuery.toLowerCase()) ??
        false) ||
      (user.firstName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ??
        false) ||
      (user.lastName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ??
        false) ||
      (user.email?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false)
    );
  });

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

  const openModal = (userId) => {
    const modal = document.getElementById(`view_profile_${userId}`);
    modal.showModal();
  };

  const closeModal = (userId) => {
    const modal = document.getElementById(`view_profile_${userId}`);
    modal.close();
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
              users="bg-primary text-white "
              locations="bg-white text-primary"
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
                <h1 className="text-center font-bold text-xl">Admin Panel</h1>
              </div>
              <ul className="text-left text-black  flex flex-col h-full mt-6">
                <Link to="/admin/users">
                  <li className=" bg-primary p-4 text-white text-xs flex gap-2 items-center">
                    <FaUsers size={25} className="text-white" />
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
            {/* User Management Table */}
            <div className="container lg:w-4/5 md:w-4/5 md:ml-auto md:mr-0 mx-auto px-4">
              <h1 className="text-2xl font-bold my-4 text-center">
                User Management
              </h1>
              <div className="border-primary  border w-full  px-2 flex items-center gap-2 rounded-md ">
                <FaSearch size={20} className="text-primary" />
                <input
                  type="text"
                  placeholder="Search for ID/Name/Email..."
                  className=" appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <h1 className="text-center pb-2 text-primary underline text-xs lg:hidden">
                  Swipe to view other data
                </h1>
                <h1 className="text-center pb-2 text-primary underline text-xs hidden lg:block">
                  Scroll to view other data
                </h1>
              </div>

              <div className="overflow-y-auto max-h-[450px]">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No users found for "{searchQuery}". Please try a different
                    search.
                  </p>
                ) : (
                  <table className="mx-auto table table-sm border-collapse">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="border px-4 py-2 text-xs text-center">
                          User ID
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Name
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Email
                        </th>
                        <th className="border px-4 py-2 text-center text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers
                        .filter((user) => user.firstName && user.lastName)
                        .map((user) => (
                          <tr key={user.id}>
                            <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-xs text-center">
                              {user.userId}
                            </td>
                            <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : ""}
                            </td>
                            <td className="border bg-gray-200 border-gray-300 px-4 py-2 text-center text-xs">
                              {user.email}
                            </td>
                            <td className="border bg-gray-200 flex-col flex gap-2  text-center">
                              {user.disabled ? (
                                <button
                                  className="btn btn-xs text-white btn-success md:btn-sm"
                                  onClick={() => enableAccount(user)}
                                >
                                  Enable
                                </button>
                              ) : (
                                <button
                                  className="btn btn-xs btn-error text-white md:btn-sm"
                                  onClick={() => disableAccount(user)}
                                >
                                  Disable
                                </button>
                              )}

                              <button
                                className="btn btn-xs btn-primary text-white md:btn-sm"
                                onClick={() => openModal(user.id)}
                              >
                                Other Details
                              </button>

                              <dialog
                                id={`view_profile_${user.id}`}
                                className="modal"
                              >
                                <div className="modal-box">
                                  <form method="dialog">
                                    <button
                                      onClick={() => closeModal(user.id)}
                                      className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                    >
                                      ✕
                                    </button>
                                  </form>
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div>
                                      <img
                                        className="w-56 h-56 object-cover rounded-full border border-primary"
                                        src={user.profilePhotoUrl}
                                        alt=""
                                      />
                                    </div>
                                    <h3 className="font-bold text-lg">
                                      {user.firstName} {user.lastName}
                                    </h3>{" "}
                                  </div>
                                  <div className="text-start">
                                    <p className="">
                                      <span className="font-bold">Email:</span>{" "}
                                      {user.email}
                                    </p>
                                    <p className="">
                                      <span className="font-bold">
                                        Contact No:
                                      </span>{" "}
                                      {user.contact}
                                    </p>
                                    <p className="">
                                      <span className="font-bold">
                                        Address:
                                      </span>{" "}
                                      {user.address}
                                    </p>
                                  </div>
                                </div>
                              </dialog>
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

export default AdminUsers;
