import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");
  const [email, setEmail] = useState(""); // for resending
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/user/verify-email/${token}`
        );

        if (res.data.success) {
          setStatus("✅ Email verified successfully! Redirecting to login...");
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          setStatus("❌ Invalid or expired link.");
          setExpired(true);
          // Optionally capture the email if backend returns it
          if (res.data.email) setEmail(res.data.email);
        }
      } catch (err) {
        console.error(err);
        const errMsg =
          err.response?.data?.message || "Verification failed or link expired.";
        setStatus(`❌ ${errMsg}`);
        if (errMsg.includes("expired")) setExpired(true);
      }
    };

    verifyEmail();
  }, [token, navigate]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f2]">
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800">Email Verification</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
