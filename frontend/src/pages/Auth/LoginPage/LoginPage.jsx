import React, { useState, useContext } from "react";
import "./LoginPage.css";
import XSmallLogo from "../../../assets/AuthAssets/XSmallLogo.png";
import { Link, useNavigate } from "react-router-dom";
import RoundedBtnActive from "../../../components/Buttons/RoundedBtnActive/RoundedBtnActive";
import GoogleLogo from "../../../assets/AuthAssets/GoogleLogo.svg";
import AppleLogo from "../../../assets/AuthAssets/AppleLogo.svg";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UserContext } from "../../../Context/UserContext";
import { useUser } from "../../../Context/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentUser, setCurrentUser, UserLoading } = useUser();
  // Handle input change
  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
    setError(""); // clear error on change
  };

  // Login handler
  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!input.email || !input.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:8000/api/v1/user/login",
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (data.success) {
        const { user, token } = data;
        // attach token to user object
        const userWithToken = { ...user, token };

        setCurrentUser(userWithToken);
        localStorage.setItem("user", JSON.stringify(userWithToken));

        toast.success(data.message);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err?.response?.data || err);
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginMainContainer">
      <div className="LoginPageContainer">
        {/* Upper Section */}
        <div className="LoginPageUpperSection">
          <img src={XSmallLogo} alt="Xvent Logo" />
          <h2>Login to your account</h2>
          <p>
            Don't have an account?{" "}
            <span>
              <Link className="signupPageLink" to="/signup">
                Sign up
              </Link>
            </span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 p-2 rounded text-lg mb-4">{error}</div>
        )}

        {/* Login Form */}
        <form onSubmit={loginHandler} className="loginForm">
          <div className="formGroup">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={input.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={input.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="formForgetPassword">
            <Link to="/forgot-password">
              <p>Forgot your password?</p>
            </Link>
          </div>

          {/* Submit Button */}
          <RoundedBtnActive
            type="submit"
            className="roundedPrimaryBtn"
            label={
              loading ? (
                <>
                  <Loader2 className="animate-spin inline-block mr-2" /> Please
                  Wait
                </>
              ) : (
                "Log in"
              )
            }
            disabled={loading}
          />
        </form>

        {/* Divider */}
        <div className="divider">
          <hr />
          <p>OR</p>
          <hr />
        </div>

        {/* OAuth Buttons */}
        <div className="oauthButtons">
          <RoundedBtnActive
            label="Continue with Google"
            type="button"
            className="roundedSecondaryBtn"
            img
            imgSrc={GoogleLogo}
            imgAlt="Google Logo"
          />
          <RoundedBtnActive
            label="Continue with Apple"
            type="button"
            className="roundedSecondaryBtn"
            img
            imgSrc={AppleLogo}
            imgAlt="Apple Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
