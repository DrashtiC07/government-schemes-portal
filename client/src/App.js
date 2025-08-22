import React, { createContext, useReducer, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";  
import { useNavigate } from "react-router-dom";
import "./App.css";
import { reducer, initialState } from "./reducers/userReducer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./components/homepage";
import Login from "./components/login";
import Register from "./components/register";
import OTP from "./components/OTP";
import Scheme from "./components/Scheme";
import InScheme from "./components/InScheme";
import Aboutus from "./components/Aboutus";
import Contactus from "./components/Contactus";
import NewForm from "./components/newform";
import AdminDashboard from "./components/AdminDashboard";
export const UserContext = createContext();

const Routing = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    const allowedPaths = [
      "/",
      "/login",
      "/register",
      "/otp",
      "/resetpassword",
      "/forgotpassword",
    ]; // Add the paths that don't require login
    const isAllowedPath = allowedPaths.some((path) =>
      window.location.pathname.startsWith(path)
    );

    if (!user && !isAllowedPath) {
      navigate("/login");
    }
    dispatch({ type: "USER", payload: user });
  }, [dispatch, navigate]);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/scheme" element={<Scheme />} />
        <Route path="/inscheme/:_id" element={<InScheme />} />
        <Route
          path="/admin"
          element={
            JSON.parse(localStorage.getItem("user"))?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contactus />} />
        <Route path="/newform" element={<NewForm />} />
      </Routes>
    </>
  );
};
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <Router>
        <Routing />
        <ToastContainer />
      </Router>
    </UserContext.Provider>
  );
}

export default App;
