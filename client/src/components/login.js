import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import { LogIn, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (state && state.isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!email || !password) {
      setError("Please provide both email and password.");
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    // Create payload
    const payload = {
      email,
      password,
    };

    try {
      // Make API call
      const response = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        // Login successful
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAdmin", data.user.isAdmin);
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch({ type: "USER", payload: data.user });
        toast.success("Login successful!");
        navigate("/");
      } else {
        // Login failed
        setError(data.error || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full bg-white rounded-xl shadow-lg overflow-hidden flex">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <div className="flex justify-center mb-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1582/1582292.png"
                alt="Logo"
                className="h-12 w-auto"
              />
            </div>
            <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access government schemes and benefits tailored for you
            </p>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div
            className="hidden lg:block lg:w-1/2 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://i.ibb.co/q3FrW0rX/image.png')`,
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-green-600/90 to-green-800/80 flex items-center">
              <div className="px-12 py-12 max-w-md">
                <h3 className="text-3xl font-bold text-white">
                  Access Government Schemes Easily
                </h3>
                <p className="mt-4 text-lg text-green-100">
                  Sign in to discover schemes tailored for you, track your
                  applications, and get updates on new opportunities.
                </p>
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Personalized scheme recommendations
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Track application status in real-time
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Receive notifications for new schemes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
