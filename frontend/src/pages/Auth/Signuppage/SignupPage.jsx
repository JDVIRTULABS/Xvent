import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import XSmallLogo from "../../../assets/AuthAssets/XSmallLogo.png";
import GoogleLogo from "../../../assets/AuthAssets/GoogleLogo.svg";
import AppleLogo from "../../../assets/AuthAssets/AppleLogo.svg";
import RoundedBtnActive from "../../../components/Buttons/RoundedBtnActive/RoundedBtnActive";

const SignupPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
    setBackendErrors({ ...backendErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({ username: "", email: "", password: "" });

    // ✅ Client-side validation
    if (!input.username || !input.email || !input.password) {
      return alert("All fields are required");
    }
    if (input.password.length < 8) {
      return setBackendErrors({ ...backendErrors, password: "Password must be at least 8 characters long" });
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        {
          username: input.username.trim(),
          email: input.email.trim(),
          password: input.password,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data.success) {
        alert("✅ Account created! Please check your email to verify your account before logging in.");
        setInput({ username: "", email: "", password: "" });
        navigate("/signin");
      }
    } catch (err) {
      console.error(err?.response?.data);
      const msg = err?.response?.data?.message || "Something went wrong";

      if (msg.includes("Username")) setBackendErrors({ ...backendErrors, username: msg });
      else if (msg.includes("Password")) setBackendErrors({ ...backendErrors, password: msg });
      else if (msg.includes("email")) setBackendErrors({ ...backendErrors, email: "Email already exists" });
      else setBackendErrors({ ...backendErrors, username: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f2] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg flex flex-col space-y-4">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <img src={XSmallLogo} alt="Logo" className="h-14 w-8 object-contain" />
          <h2 className="text-2xl font-medium text-gray-800 text-center">Create your account</h2>
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold underline text-gray-700">Log in</Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Username */}
          <div className="flex flex-col">
            <label htmlFor="username" className="text-sm font-medium mb-1 text-gray-500">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={input.username}
              onChange={handleChange}
              className="h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition"
              style={{ borderColor: backendErrors.username ? "red" : "rgba(102, 102, 102, 0.35)" }}
            />
            {backendErrors.username && <p className="text-red-600 text-sm mt-1">{backendErrors.username}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium mb-1 text-gray-500">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={input.email}
              onChange={handleChange}
              className="h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition"
              style={{ borderColor: backendErrors.email ? "red" : "rgba(102, 102, 102, 0.35)" }}
            />
            {backendErrors.email && <p className="text-red-600 text-sm mt-1">{backendErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm font-medium mb-1 text-gray-500">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={input.password}
              onChange={handleChange}
              className="h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition"
              style={{ borderColor: backendErrors.password ? "red" : "rgba(102, 102, 102, 0.35)" }}
            />
            {backendErrors.password && <p className="text-red-600 text-sm mt-1">{backendErrors.password}</p>}
          </div>

          {/* Terms */}
          <label className="flex items-start space-x-2 text-sm text-gray-500">
            <input type="checkbox" required className="mt-1" style={{ accentColor: "#111111" }} />
            <span>
              By creating an account, I agree to our{" "}
              <Link to="/terms-of-service" className="underline font-medium text-gray-700">Terms of use</Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="underline font-medium text-gray-700">Privacy Policy</Link>
            </span>
          </label>

          {/* Signup Button */}
          <button
            type="submit"
            className="h-14 w-full rounded-xl flex items-center justify-center font-semibold transition disabled:opacity-50"
            style={{ backgroundColor: "#e6684f", color: "white" }}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
            {loading ? "Please Wait" : "Sign Up"}
          </button>
        </form>

        <div className="divider">
          <hr />
          <p>OR</p>
          <hr />
        </div>

        <div className="oauthButtons">
          <RoundedBtnActive
            label={"Continue with Google"}
            type={"submit"}
            className={"roundedSecondaryBtn"}
            img={true}
            imgSrc={GoogleLogo}
            imgAlt="Google Logo"
          />
          <RoundedBtnActive
            label={"Continue with Apple"}
            type={"submit"}
            className={"roundedSecondaryBtn"}
            img={true}
            imgSrc={AppleLogo}
            imgAlt="Apple Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
