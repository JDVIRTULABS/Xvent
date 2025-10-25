import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoginNavbar from "../components/Navbar/LoginNavbar";
import { useUser } from "../Context/UserContext";

const AuthLayout = () => {
  const { user, loading } = useUser();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  // Redirect if not logged in
  if (!user) return <Navigate to="/signin" />;

  return (
    <div className="authLayoutContainer">
      <LoginNavbar />
      <main className="mainContent">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AuthLayout;
