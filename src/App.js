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
import About from "./components/logged/About";
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

function AppRoutes() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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

  const navbarHiddenRoutes = ["/", "/login", "/register"];

  const isNavbarHidden = navbarHiddenRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!isNavbarHidden && !location.pathname.startsWith("/admin") && user && (
        <NavbarLogged />
      )}

      <Routes>
        <Route
          path="/"
          element={
            user && user.email === "bacoorogmarket@gmail.com" ? (
              <Navigate to="/admin/users" />
            ) : user ? (
              <Navigate to="/home" />
            ) : (
              <Landing />
            )
          }
        />
        <Route
          path="/home"
          element={user ? <Hero /> : <Navigate to="/login" />}
        />
        <Route
          path="/about"
          element={user ? <About /> : <Navigate to="/login" />}
        />
        <Route
          path="/faqs"
          element={user ? <Faq /> : <Navigate to="/login" />}
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
          path="/myaccount"
          element={user ? <MyAccount /> : <Navigate to="/login" />}
        />
        <Route
          path="/post_recipe"
          element={user ? <PostARecipe /> : <Navigate to="/login" />}
        />{" "}
        <Route
          path="/post_product"
          element={user ? <PostAProduct /> : <Navigate to="/login" />}
        />
        <Route
          path="/marketplace"
          element={user ? <Marketplace /> : <Navigate to="/login" />}
        />
        <Route
          path="/recipe"
          element={user ? <Recipe /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users"
          element={
            user && user.email === "bacoorogmarket@gmail.com" ? (
              <AdminUsers />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/products"
          element={
            user && user.email === "bacoorogmarket@gmail.com" ? (
              <AdminProducts />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/locations"
          element={
            user && user.email === "bacoorogmarket@gmail.com" ? (
              <AdminLocations />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/recipes"
          element={
            user && user.email === "bacoorogmarket@gmail.com" ? (
              <AdminRecipes />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
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
