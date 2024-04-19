import React, { useState, useEffect } from "react";
import appealbg from "../../assets/appealbg.png";
import { firestore, auth } from "../../firebase"; // Import firestore and auth
import { setDoc, doc, getDoc } from "firebase/firestore"; // Import setDoc, doc, and getDoc
import Swal from "sweetalert2"; // Import SweetAlert
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA
import { CiLogout } from "react-icons/ci";

const Appeal = () => {
  const [email, setEmail] = useState(""); // State for email
  const [reason, setReason] = useState("");
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState(null); // State to hold existing appeal data
  const [disabledReason, setDisabledReason] = useState(null); // State to hold disabled reason

  useEffect(() => {
    // Fetch the currently authenticated user's email and set it as the initial value for email state
    const fetchUserEmail = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };
    fetchUserEmail();

    // Fetch existing appeal if it exists
    const fetchExistingAppeal = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const docRef = doc(firestore, "userAppeal", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setExistingAppeal(data.reason); // Set existing appeal reason
            setReason(data.reason); // Set reason in state for editing
          }
        }
      } catch (error) {
        console.error("Error fetching existing appeal:", error);
      }
    };
    fetchExistingAppeal();

    const fetchDisabledReason = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          // Fetch disabled reason
          const disabledReasonDocRef = doc(firestore, "disabledReason", userId);
          const disabledReasonDocSnap = await getDoc(disabledReasonDocRef);
          if (disabledReasonDocSnap.exists()) {
            const data = disabledReasonDocSnap.data();
            setDisabledReason(data.reason); // Set disabled reason
          }
        }
      } catch (error) {
        console.error("Error fetching disabled reason:", error);
      }
    };
    fetchDisabledReason();
  }, []); // Run this effect only once after the component mounts

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
      // Get the current user's ID
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Handle case where user is not authenticated
        console.error("User not authenticated");
        return;
      }
      const userId = currentUser.uid;

      if (existingAppeal) {
        // If existing appeal exists, update the document
        await setDoc(doc(firestore, "userAppeal", userId), {
          email,
          reason,
          userId,
        });
        // Show success message using SweetAlert
        await Swal.fire({
          icon: "success",
          title: "Appeal Updated",
          text: "Your appeal has been successfully updated.",
        });
      } else {
        // Otherwise, submit a new appeal
        await setDoc(doc(firestore, "userAppeal", userId), {
          email,
          reason,
          userId,
        });
        // Show success message using SweetAlert
        await Swal.fire({
          icon: "success",
          title: "Appeal Submitted",
          text: "Your appeal has been successfully submitted. Please wait for the admin to review it.",
        });
      }
      // Reset the form fields after submission
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

  const onRecaptchaChange = () => {
    setRecaptchaCompleted(true);
  };

  const handleLogout = async () => {
    // Show confirmation dialog using SweetAlert
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await auth.signOut(); // Sign out the user
          // You can redirect the user to the login page or any other page if needed
          console.log("User logged out successfully");
        } catch (error) {
          console.error("Error logging out:", error);
          // Handle error
        }
      }
    });
  };

  return (
    <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={appealbg}
        alt=""
      />

      <div className="max-w-md w-full  space-y-8  bg-white  p-6 lg:p-8  shadow-primary rounded-lg shadow-md">
        <div className="flex items-center w-full justify-end">
          <button
            onClick={handleLogout}
            className="btn btn-xs btn-error flex items-center text-white"
          >
            Logout <CiLogout />
          </button>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {existingAppeal
              ? "Your appeal is under review"
              : "Appeal Your Account Suspension"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {existingAppeal
              ? "Do you wish to update your reason to appeal your account suspension?"
              : "Provide additional information to appeal your account suspension."}
          </p>
        </div>
        <div>
          <h1 className="text-center text-xs md:text-base  ">
            Your account has been disabled due to reason; <br />
            <span className="italic text-red-600">{disabledReason}</span>
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-2">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <h1 className="input input-bordered flex items-center gap-2">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  readOnly
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none grow pointer-events-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </h1>
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
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
              {existingAppeal ? "Update Appeal" : "Submit Appeal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Appeal;
