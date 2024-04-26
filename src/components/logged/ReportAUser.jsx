import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "../../authContext";
import Swal from "sweetalert2";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firestore, storage } from "../../firebase";

const ReportAUser = () => {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const usersCollection = collection(db, "registered");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.firstName && user.lastName)
          .filter((user) => user.email !== "bacoorogmarket@gmail.com")
          .filter((user) => user.id !== currentUser.uid);
        setRegisteredUsers(usersData);
        setDisplayedUsers(usersData.slice(0, 6));
      } catch (error) {
        console.error("Error fetching registered users:", error);
      }
    };

    fetchRegisteredUsers();
  }, [db, currentUser]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      // If search term is empty, display the first 6 users
      setDisplayedUsers(registeredUsers.slice(0, 6));
    } else {
      // If search term is not empty, filter users based on the search term
      const filteredUsers = registeredUsers.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return (
          fullName.includes(value) || user.email.toLowerCase().includes(value)
        );
      });
      setDisplayedUsers(filteredUsers);
    }
  };

  const handleReportProfile = async (selectedUser) => {
    try {
      const { value: reason } = await Swal.fire({
        title: `Why do you want to report ${selectedUser.firstName}?`,
        input: "select",
        inputOptions: {
          Spam: "Spam",
          "Identity Theft": "Identity Theft",
          "Scamming/Bogus Buyer": "Scamming/Bogus Buyer",
          "Inappropriate Display Picture": "Inappropriate Display Picture",
          "Harassment or Bullying": "Harassment or Bullying",
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
          <label for="file" class="text-sm">Upload a photo as proof (Required)</label>
          <input type="file" id="file" accept="image/*" class="file-input file-input-bordered file-input-primary w-full max-w-xs my-2"/>
          <textarea id="swal-input2" class="p-3 input input-bordered w-full" placeholder="Explain why"></textarea>
        `,
        preConfirm: async () => {
          const file = document.getElementById("file").files[0];
          const reason = Swal.getPopup().querySelector(".swal2-select").value;
          const explanation =
            Swal.getPopup().querySelector("#swal-input2").value;

          if (!file || !reason || !explanation) {
            Swal.showValidationMessage("Please fill out all fields");
            return;
          }

          try {
            const randomFileName = Math.random().toString(36).substring(2);
            const storageRef = ref(
              storage,
              `profileReports/${selectedUser.userId}/${randomFileName}`
            );
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            // Check if the selectedUser is deleted
            if (selectedUser.isDeleted) {
              // If the selectedUser is deleted, set isDeleted to true in the report data
              const reportData = {
                reason,
                explanation,
                userId: selectedUser.userId,
                timestamp: serverTimestamp(),
                photoUrl: fileUrl,
                isDeleted: true, // Set isDeleted to true
              };

              await addDoc(collection(firestore, "profileReports"), reportData);
            } else {
              const reportData = {
                reason,
                explanation,
                userId: selectedUser.userId,
                timestamp: serverTimestamp(),
                photoUrl: fileUrl,
              };

              await addDoc(collection(firestore, "profileReports"), reportData);
            }

            Swal.fire({
              title: "Report Submitted!",
              text: "Thank you for your report. Our team will review it.",
              icon: "success",
            });
          } catch (error) {
            console.error("Error uploading photo:", error);
            Swal.fire(
              "Error!",
              "An error occurred while uploading the photo.",
              "error"
            );
          }
        },
      });

      if (!reason) {
        Swal.fire({
          title: "Cancelled",
          text: "Your report has been cancelled",
          icon: "error",
          confirmButtonColor: "#008080",
        });
      }
    } catch (error) {
      console.error("Error reporting profile:", error);
      Swal.fire(
        "Error!",
        "An error occurred while reporting the profile.",
        "error"
      );
    }
  };

  return (
    <div className="container pt-28 md:pb-10 pb-28 mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Report a Users</h2>
      <input
        type="text"
        placeholder="Search by email or name"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 border rounded mb-4"
      />
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedUsers.map((user) => (
          <li key={user.id} className="glass shadow-md rounded-lg p-4 relative">
            {user.isDeleted && (
              <span className="absolute top-[-10px] right-0 text-xs md:text-base bg-red-500 text-white px-2 py-1 rounded">
                Deleted Account
              </span>
            )}
            {user.isDeactivated && (
              <span className="absolute top-[-10px] right-0 text-xs md:text-base bg-red-500 text-white px-2 py-1 rounded">
                Deactivated Account
              </span>
            )}
            {!user.isDeleted && !user.isDeactivated && (
              <span className="absolute top-[-10px] right-0 text-xs md:text-base bg-blue-500 text-white px-2 py-1 rounded">
                Existing User
              </span>
            )}
            <img
              src={user.profilePhotoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-20 h-20 object-cover md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto rounded-full mb-4"
            />
            <p className="text-lg font-semibold text-center mb-2">
              {`${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-gray-600 text-center">{user.email}</p>
            <div className="flex justify-center">
              <button
                onClick={() => handleReportProfile(user)}
                className="btn btn-error btn-xs md:btn-sm text-white"
              >
                Report {user.firstName}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportAUser;
