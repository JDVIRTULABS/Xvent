import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Settings, HelpCircle } from "lucide-react";
import axios from "axios";
import { useUser } from "../Context/UserContext";

const HeaderProfileMenu = () => {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/api/v1/user/logout", { withCredentials: true });
      setCurrentUser(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { title: "My Profile", icon: User, link: "/profile/me" },
    { title: "Settings", icon: Settings, link: "/settings" },
    { title: "Help", icon: HelpCircle, link: "/help" },
    { title: "Logout", icon: LogOut, action: handleLogout },
  ];

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden focus:outline-none"
      >
        {currentUser?.profilePicture ? (
          <img src={currentUser.profilePicture} alt="profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {openMenu && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
          {menuItems.map((item, idx) => (
            item.link ? (
              <Link
                key={idx}
                to={item.link}
                onClick={() => setOpenMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.title}
              </Link>
            ) : (
              <button
                key={idx}
                onClick={item.action}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.title}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderProfileMenu;
