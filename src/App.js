import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import NavbarLogged from "./components/logged/NavbarLogged";
import About from "./components/logged/About";
import Landing from "./components/guest/Landing";
import Hero from "./components/logged/Hero";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import MyAccount from "./components/logged/MyAccount";

function AppRoutes() {
  const location = useLocation();

  const navbarHiddenRoutes = ["/", "/login", "/register"];

  const isNavbarHidden = navbarHiddenRoutes.includes(location.pathname);
  return (
    <div className="App">
      {!isNavbarHidden && <NavbarLogged />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Hero />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/myaccount" element={<MyAccount />} />
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
