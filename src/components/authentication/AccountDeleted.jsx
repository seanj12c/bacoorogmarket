import React from "react";
import loginbg from "../../assets/loginbg.png";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AccountDeleted = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
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

  return (
    <div className="min-h-screen px-1 md:px-0 flex items-center justify-center ">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={loginbg}
        alt=""
      />
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl text-center font-semibold mb-4">
          Your Account has been Deleted!
        </h2>
        <p className="text-center mb-4">
          If you want to use our app again, please create a new account using a
          different Google account.
        </p>
        <div className="flex flex-col gap-2 justify-between mt-8">
          <button className="bg-base btn" onClick={handleLogoutConfirmation}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDeleted;
