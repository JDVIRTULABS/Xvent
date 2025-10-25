import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import NavbarDesktop from "../components/Navbar/NavbarDesktop";
import NavbarLoggedIn from "../components/Navbar/NavbarLoggedIn";
import { MapPin } from "lucide-react";
import axios from "axios";
import HeaderProfileMenu from "../components/HeaderProfileMenu";


const MainLayout = () => {
  const { currentUser } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState("Unknown");
  const navigate = useNavigate();
  const location = useLocation();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && currentUser && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [loading, currentUser, location, navigate]);

  // Fetch events
  useEffect(() => {
    if (!currentUser) return;

    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/event/all`, {
          withCredentials: true,
        });
        setEvents(Array.isArray(res.data.events) ? res.data.events : []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Simple reverse geocode using OpenStreetMap Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            setUserLocation(data.address.city || data.address.town || data.address.state || "Unknown");
          })
          .catch(() => setUserLocation("Unknown"));
      },
      () => setUserLocation("Unknown")
    );
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarDesktop />
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm min-h-96">
            <Outlet />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F2]">
      {currentUser && <NavbarLoggedIn />}

      <div className={`${currentUser ? "lg-64" : ""} min-h-screen`}>
        {currentUser && (
         <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      
      {/* Left: Logo + User Location */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <div className="flex-shrink-0 mr-5">
          <img
            src="XventLogo.png" // replace with your logo path
            alt="Xvent Logo"
            className="h-6 sm:h-7 md:h-8 w-auto"
          />
        </div>

        {/* User Location */}
        <div className="flex items-center  text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{userLocation}</span>
        </div>
      </div>

      {/* Right: Profile Menu */}
      <div className="flex items-center space-x-4">
        <HeaderProfileMenu />
      </div>
    </div>
  </div>
</header>

        )}

        <div className="flex">
          <main className={`flex-1 ${currentUser ? "max-w-10xl" : "max-w-10xl mx-auto"} p-6`}>
            <div className="bg-[#FAF9F2] rounded-lg shadow-sm min-h-96">
              <Outlet />
            </div>
          </main>

          {/* Right Sidebar (only for logged-in users) */}
          {currentUser && (
            <aside className="w-80 hidden xl:block space-y-6 p-6">
              {/* Top Events */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Top Events Authors</h3>
                <div className="space-y-2">
                  {events
                    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
                    .slice(0, 5)
                    .map((event, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-800">
                        <img
                          src={event.author?.profilePicture || "/default-avatar.png"}
                          alt={event.author?.username || "Unknown"}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{event.author?.username || "Unknown"}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">Recent Activity Authors</h3>
                <div className="space-y-2">
                  {events
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 4)
                    .map((event, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-800">
                        <img
                          src={event.author?.profilePicture || "/default-avatar.png"}
                          alt={event.author?.username || "Unknown"}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{event.author?.username || "Unknown"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
