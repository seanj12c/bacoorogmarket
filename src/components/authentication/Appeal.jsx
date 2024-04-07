import React, { useState } from "react";
import appealbg from "../../assets/appealbg.png";
import { firestore } from "../../firebase"; // Import firestore
import { collection, addDoc } from "firebase/firestore"; // Import collection and addDoc
import Swal from "sweetalert2"; // Import SweetAlert
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA

const Appeal = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!recaptchaCompleted) {
      // Show error message using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please complete the ReCAPTCHA before submitting your appeal.",
      });
      return;
    }
    try {
      // Add an appeal document to the "userAppeal" collection
      const appealRef = await addDoc(collection(firestore, "userAppeal"), {
        email,
        reason,
      });
      console.log("Appeal submitted with ID: ", appealRef.id);
      // Show success message using SweetAlert
      await Swal.fire({
        icon: "success",
        title: "Appeal Submitted",
        text: "Your appeal has been successfully submitted. Please wait for the admin to review it.",
      });
      // Reset the form fields after submission
      setEmail("");
      setReason("");
      setRecaptchaCompleted(false);
    } catch (error) {
      console.error("Error submitting appeal:", error);
      // Show error message using SweetAlert
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while submitting your appeal. Please try again later.",
      });
    }
  };

  const onRecaptchaChange = (value) => {
    setRecaptchaCompleted(true);
  };

  return (
    <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={appealbg}
        alt=""
      />
      <div className="max-w-md w-full  space-y-8  bg-white  p-6 lg:p-8  shadow-primary rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Appeal Your Account Suspension
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Provide additional information to appeal your account suspension.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="reason" className="sr-only">
                Reason for Appeal
              </label>
              <textarea
                id="reason"
                name="reason"
                rows="4"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Reason for Appeal"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LfMC7MpAAAAALEC3epHtCPGpNsPiB4r3pSwrvL-"
              onChange={onRecaptchaChange}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary  w-full flex justify-center"
            >
              Submit Appeal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appeal;
