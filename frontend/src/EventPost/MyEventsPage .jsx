import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, MapPin, Edit, Trash, X } from "lucide-react";
import { useUser } from "../Context/UserContext";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

const MyEventsPage = () => {
  const { currentUser } = useUser();
  const currentUserId = currentUser?._id;
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's events
  const fetchMyEvents = async () => {
    try {
      const res = await api.get("/event/userevent/all");
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your events");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMyEvents().finally(() => setLoading(false));
  }, [currentUserId]);

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/event/${id}/delete`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  // Navigate to update page
  const handleUpdate = (id) => {
    navigate(`/myevent/${id}`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F2]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your events...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F2] py-4 sm:py-6 px-3 sm:px-4 lg:px-8 ml-0 sm:ml-64">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          My Events
        </h1>

        {events.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-600 text-lg">You haven't created any events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title || "Event Image"}
                    className="w-full h-48 sm:h-56 object-cover cursor-pointer"
                    onClick={() => navigate(`/event/${event._id}`)}
                  />
                )}

                <div className="p-4 flex flex-col gap-2">
                  <h2
                    className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/event/${event._id}`)}
                  >
                    {event.title || "Untitled Event"}
                  </h2>

                  {event.category && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                      {event.category}
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue || "No Venue"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(event._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#FB432C]/90 text-white hover:bg-[#FB432C] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-600 transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
