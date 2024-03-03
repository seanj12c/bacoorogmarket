import React from "react";
import sad from "../../assets/sad.gif";

const LogoutModal = ({ handleLogout, closeModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 ease-linear duration-500 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg transform scale-100 transition-transform duration-300">
        <p className="text-center text-lg font-semibold mb-4">
          Are you sure you want to Log-out?
        </p>
        <div className="flex justify-center p-3">
          <img className="h-20 object-contain" src={sad} alt="" />
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md "
          >
            Yes
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md "
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
