import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  FileText, 
  Calendar, 
  HelpCircle, 
  Settings,
  LogOut 
} from "lucide-react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";

const NavbarLoggedIn = () => {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation(); 

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/v1/user/logout`, { withCredentials: true });
      setCurrentUser(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const Navlinks = [
    { NavTitle: "Home", link: "/dashboard", icon: Home },
    { NavTitle: "Profile", link: "/profile/me", icon: User },
    { NavTitle: "Discover Events", link: "/discover", icon: User },
    { NavTitle: "Bookmarks", link: "/bookmark", icon: User },

    { NavTitle: "My Posts", link: "/my-post", icon: FileText },
    { NavTitle: "Events", link: "/events", icon: Calendar },
    { NavTitle: "My Events", link: "/myevents", icon: Calendar },
    { NavTitle: "Help", link: "/help", icon: HelpCircle },
    { NavTitle: "Settings", link: "/settings", icon: Settings },
  ];
  const MobileNavlinks = [
    { NavTitle: "Home", link: "/dashboard", icon: Home },
    { NavTitle: "Discover Events", link: "/discover", icon: User },
    { NavTitle: "Bookmarks", link: "/bookmark", icon: User },
    { NavTitle: "My Posts", link: "/my-post", icon: FileText },
    { NavTitle: "Events", link: "/events", icon: Calendar },
    { NavTitle: "My Events", link: "/myevents", icon: Calendar },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 h-screen bg-[#FAF9F2] border-r border-gray-200 shadow-sm fixed z-40">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 mb-5 px-4">
          <Link to="/dashboard">
            <img src="/XventLogo.png" alt="Xvent Logo" className="h-12" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {Navlinks.map((link, index) => {
              const isActive = location.pathname === link.link;
              return (
                <Link
                  key={index}
                  to={link.link}
                  className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-[#F0EFE9]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.NavTitle}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profile + Logout */}
        <div className="px-4 py-6 border-t">
          <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center space-x-3">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                {currentUser?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">
                {currentUser?.username}
              </div>
              <div className="text-xs text-gray-500 truncate">
                @{currentUser?.username?.toLowerCase()}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center h-14 z-50">
        {MobileNavlinks.map((link, index) => {
          const isActive = location.pathname === link.link;
          return (
            <Link
              key={index}
              to={link.link}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? "text-[#FB432C]" : "text-gray-500"
              }`}
            >
              <link.icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{link.NavTitle}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default NavbarLoggedIn;
