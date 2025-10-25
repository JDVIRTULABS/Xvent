import React from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";

const NavbarDesktop = () => {
  const Navlinks = [
    {
      NavTitle: "Home",
      link: "/",
    },
    {
      NavTitle: "Events",
      link: "/events",
    },
    {
      NavTitle: "About",
      link: "/about",
    },
  ];

  return (
    <nav className="w-full bg-[#FAF9F2] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/XventLogo.png" alt="Xvent Logo" className="h-8" />
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {Navlinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="text-gray-700 hover:text-black font-medium transition-colors"
            >
              {link.NavTitle}
            </Link>
          ))}
          <button className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors">
            <IoMdAddCircleOutline fontSize="24px" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/signin"
            className="text-gray-700 hover:text-black font-semibold transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarDesktop;