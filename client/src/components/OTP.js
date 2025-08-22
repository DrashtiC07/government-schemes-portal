import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import { UserContext } from "../App";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(UserContext);
  const queryParams = new URLSearchParams(location.search);
  const userEmail = queryParams.get("email") || "";

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const otp = otpValues.join("");

  useEffect(() => {
    let isMounted = true;

    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        if (isMounted) {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
      return () => {
        isMounted = false;
        clearTimeout(timerId);
      };
    } else {
      if (isMounted) {
        setCanResend(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text/plain").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.token) {
          // Store the token and user data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Update context
          dispatch({ type: "USER", payload: data.user });
        }

        toast.success("Email verified successfully!");
        navigate("/");
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      const response = await fetch("http://localhost:5000/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("New OTP has been sent to your email.");
        setTimeLeft(120);
        setCanResend(false);
        setOtpValues(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        toast.error(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full bg-white rounded-xl shadow-lg overflow-hidden flex">
          {/* Left Side - Image */}
          <div
            className="hidden lg:block lg:w-1/2 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://i.ibb.co/q3FrW0rX/image.png')`,
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-green-600/90 to-green-800/80 flex items-center">
              <div className="px-12 py-12 max-w-md">
                <h3 className="text-3xl font-bold text-white">
                  Verify Your Account
                </h3>
                <p className="mt-4 text-lg text-green-100">
                  We've sent a verification code to your email. Please enter it
                  below to complete your account setup.
                </p>
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Protects your account security
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Ensures your email is valid
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100/30 flex items-center justify-center rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 text-white">
                      Helps prevent fraudulent accounts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <div className="flex justify-center mb-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1582/1582292.png"
                alt="Logo"
                className="h-12 w-auto"
              />
            </div>
            <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit verification code to{" "}
              <span className="font-medium text-gray-900">{userEmail}</span>
            </p>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8">
              <form onSubmit={handleOTPVerification}>
                <div className="mb-6">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Verification Code
                  </label>

                  <div
                    className="flex justify-center space-x-2 sm:space-x-4"
                    onPaste={handlePaste}
                  >
                    {otpValues.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={digit}
                        maxLength={1}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        autoFocus={index === 0}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-8 text-center">
                  <p className="text-sm text-gray-600">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="text-green-600 hover:text-green-500 font-medium inline-flex items-center disabled:opacity-70"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Resend verification code
                          </>
                        )}
                      </button>
                    ) : (
                      <span>
                        Code expires in{" "}
                        <span className="font-medium text-gray-900">
                          {formatTime(timeLeft)}
                        </span>
                      </span>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-green-600 shadow-sm transition-colors ${
                    isSubmitting || otp.length !== 6
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
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
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Verify Account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <div className="flex items-center justify-center text-sm">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Didn't receive the email? Check your spam folder
                  </span>
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

export default OTP;
