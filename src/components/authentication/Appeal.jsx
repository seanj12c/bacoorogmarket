import React, { useState, useEffect } from "react";
import appealbg from "../../assets/appealbg.png";
import { firestore, auth } from "../../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";
import { CiLogout } from "react-icons/ci";

const Appeal = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [recaptchaCompleted, setRecaptchaCompleted] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState(null);
  const [disabledReason, setDisabledReason] = useState(null);
  const [disabledExplanation, setDisabledExplanation] = useState(null);

  useEffect(() => {
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

    const fetchExistingAppeal = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const docRef = doc(firestore, "userAppeal", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setExistingAppeal(data.reason);
            setReason(data.reason);
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

          const disabledReasonDocRef = doc(firestore, "disabledReason", userId);
          const disabledReasonDocSnap = await getDoc(disabledReasonDocRef);
          if (disabledReasonDocSnap.exists()) {
            const data = disabledReasonDocSnap.data();
            setDisabledReason(data.reason);
            setDisabledExplanation(data.explanation);
          }
        }
      } catch (error) {
        console.error("Error fetching disabled reason:", error);
      }
    };
    fetchDisabledReason();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!recaptchaCompleted) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please complete the ReCAPTCHA before submitting your appeal.",
      });
      return;
    }
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }
      const userId = currentUser.uid;

      if (existingAppeal) {
        await setDoc(doc(firestore, "userAppeal", userId), {
          email,
          reason,
          userId,
        });

        await Swal.fire({
          icon: "success",
          title: "Appeal Updated",
          text: "Your appeal has been successfully updated.",
        });
      } else {
        await setDoc(doc(firestore, "userAppeal", userId), {
          email,
          reason,
          userId,
        });

        await Swal.fire({
          icon: "success",
          title: "Appeal Submitted",
          text: "Your appeal has been successfully submitted. Please wait for the admin to review it.",
        });
      }

      setRecaptchaCompleted(false);
    } catch (error) {
      console.error("Error submitting appeal:", error);

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
          await auth.signOut();

          console.log("User logged out successfully");
        } catch (error) {
          console.error("Error logging out:", error);
        }
      }
    });
  };

  return (
    <div className="h-screen flex items-center justify-center py-12 sm:px-6 lg:px-8">
      <img
        className="z-[-1] absolute h-screen w-screen mx-auto object-cover pointer-events-none select-none"
        src={appealbg}
        alt=""
      />

      <div className="max-w-md md:max-w-xl w-full  space-y-1   bg-white  p-6 lg:p-8  shadow-primary rounded-lg shadow-md">
        <div className="flex items-center w-full justify-end">
          <button
            onClick={handleLogout}
            className="btn btn-xs btn-error flex items-center text-white"
          >
            Logout <CiLogout />
          </button>
        </div>
        <div>
          <h2 className="mt-6 text-center text-lg md:text-3xl font-extrabold text-gray-900">
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
          <h1 className="text-center text-xs  ">
            Your account has been disabled due to reason; <br />
            <span className="italic font-bold text-red-600">
              {disabledReason}
            </span>
          </h1>
          <h1 className="text-xs">
            Explanation:{" "}
            <span className="italic font-bold text-red-600">
              {disabledExplanation}
            </span>
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
