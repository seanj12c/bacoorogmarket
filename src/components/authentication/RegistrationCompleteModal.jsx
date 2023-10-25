import React from "react";
import { Link } from "react-router-dom";
import check from "../../assets/check.gif";

const RegistrationCompleteModal = ({ onClose, onLoginNowClick }) => {
  return (
    <div className="h-screen bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold my-2">Registration Complete</h2>
        <p className="my-2">
          Your registration has been successfully completed.
        </p>
        <img className="mx-auto h-20 object-contain" src={check} alt="" />
        <Link
          to="/login"
          className="bg-primary flex justify-center text-white mt-4 px-4 py-2 rounded-lg
          hover:bg-primary-dark focus:outline-none"
          onClick={() => {
            onClose();
            onLoginNowClick();
          }}
        >
          {" "}
          Login Now
        </Link>
      </div>
    </div>
  );
};

export default RegistrationCompleteModal;
