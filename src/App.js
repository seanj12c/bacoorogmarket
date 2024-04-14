import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import NavbarLogged from "./components/logged/NavbarLogged";

import Landing from "./components/guest/Landing";
import Hero from "./components/logged/Hero";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import MyAccount from "./components/logged/MyAccount";
import PostARecipe from "./components/logged/PostARecipe";
import Recipe from "./components/logged/Recipe";
import { auth } from "./firebase";
import uploadload from "./assets/loading.gif";
import Faq from "./components/logged/Faq";
import PostAProduct from "./components/logged/PostAProduct";
import Marketplace from "./components/logged/Marketplace";
import AdminUsers from "./components/admin/AdminUsers";
import AdminProducts from "./components/admin/AdminProducts";
import AdminLocations from "./components/admin/AdminLocations";
import AdminRecipes from "./components/admin/AdminRecipes";
import AdminAppeal from "./components/admin/AdminAppeal";
import AdminReports from "./components/admin/AdminReports";
import AdminDelete from "./components/admin/AdminDelete";
import Fillup from "./components/authentication/Fillup";
import Chat from "./components/logged/Chat";
import DeleteConfirmation from "./components/authentication/DeleteConfirmation";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import Profile from "./components/logged/Profile";
import EditProduct from "./components/logged/EditProduct";
import EditRecipe from "./components/logged/EditRecipe";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sellers from "./components/logged/Sellers";
import ProductInfo from "./components/logged/ProductInfo";
import RecipeInfo from "./components/logged/RecipeInfo";
import Swal from "sweetalert2";
import Appeal from "./components/authentication/Appeal";

function AppRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disableReason, setDisableReason] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        if (authUser.email === "bacoorogmarket@gmail.com") {
          setAdmin(authUser);
        } else {
          setAdmin(null);
        }
        // Check if user is disabled
        const db = getFirestore();
        const userRef = doc(collection(db, "registered"), authUser.uid);

        try {
          const docSnap = await getDoc(userRef);
          const userData = docSnap.data();
          if (userData.deleteAccount) {
            setLoading(false);
            navigate("/deletion/confirmation");
          } else if (userData.disabled) {
            // Fetch reason from "disabledReason" collection based on user's UID
            const reasonRef = doc(
              collection(db, "disabledReason"),
              authUser.uid
            );
            const reasonDoc = await getDoc(reasonRef);
            const reasonData = reasonDoc.data();
            setDisableReason(
              reasonData ? reasonData.reason : "No reason provided"
            );
            navigate("/user/appeal");
            setLoading(false);
            Swal.fire({
              icon: "error",
              title: "Account Disabled",
              html: `Sorry, your account has been disabled.<br>Reason: ${disableReason}.<br><br>If you think this is a mistake, you can appeal by clicking the button below`,
              showCancelButton: true,
              confirmButtonText: "Logout",
              cancelButtonText: "Appeal",
            }).then((result) => {
              if (result.isConfirmed) {
                auth.signOut();
                navigate("/login");
              }
            });
          } else {
            if (!userData.doneFillup) {
              navigate("/fillup");
              setLoading(false);
            } else {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error getting document:", error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setAdmin(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, disableReason]);

  // Function to handle account deletion

  if (loading) {
    return (
      <div className="h-screen pt-0 w-full grid items-center">
        <img
          className="lg:h-32 h-20 md:h-28 object-contain mx-auto flex justify-center items-center"
          src={uploadload}
          alt=""
        />
      </div>
    );
  }

  const navbarHiddenRoutes = [
    "/",
    "/login",
    "/register,",
    "/fillup",
    "/user/appeal",
    "/deletion/confirmation",
  ];

  const isNavbarHidden = navbarHiddenRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!isNavbarHidden &&
        !location.pathname.startsWith("/admin") &&
        !location.pathname.startsWith("/product/info") &&
        user && <NavbarLogged />}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.email === "bacoorogmarket@gmail.com" ? (
                <Navigate to="/admin/users" />
              ) : (
                <Navigate to="/home" />
              )
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              user.email === "bacoorogmarket@gmail.com" ? (
                <Navigate to="/admin/users" />
              ) : (
                <Navigate to="/home" />
              )
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/fillup"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Fillup />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/home"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Hero />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/faqs"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Faq />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />{" "}
        <Route
          path="/chat"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Chat />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/home" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/home" />}
        />
        <Route
          path="/user/appeal"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Appeal />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/myaccount"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <MyAccount />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/post_recipe"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <PostARecipe />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />{" "}
        <Route
          path="/deletion/confirmation"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <DeleteConfirmation />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/edit_product/:productId" element={<EditProduct />} />
        <Route path="/edit_recipe/:recipeId" element={<EditRecipe />} />
        <Route path="/product/info/:productId" element={<ProductInfo />} />
        <Route path="/recipe/info/:recipeId" element={<RecipeInfo />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route
          path="/post_product"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <PostAProduct />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/marketplace"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Marketplace />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/sellers"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Sellers />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/recipe"
          element={
            user ? (
              admin ? (
                <Navigate to="/admin/users" />
              ) : (
                <Recipe />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/users"
          element={admin ? <AdminUsers /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/products"
          element={admin ? <AdminProducts /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/locations"
          element={admin ? <AdminLocations /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/recipes"
          element={admin ? <AdminRecipes /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/appeal"
          element={admin ? <AdminAppeal /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/reports"
          element={admin ? <AdminReports /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/delete/user"
          element={admin ? <AdminDelete /> : <Navigate to="/login" />}
        />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
