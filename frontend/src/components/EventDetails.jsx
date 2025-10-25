import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "../Context/UserContext";
import {
  Loader2,
  Calendar,
  MapPin,
  Bookmark,
  ArrowLeft,
  Clock,
  Users,
  Share2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const EventDetails = () => {
  const { currentUser } = useUser();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    fetchEvent();
    if (currentUser) checkBookmark();
  }, [id, currentUser]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/event/${id}`,
        {
          withCredentials: true,
        }
      );
      setEvent(data.event);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/user/bookmarks`,
        {
          withCredentials: true,
        }
      );
      setIsBookmarked(data.bookmarks.some((b) => (b._id || b) === id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) return toast.error("Please login to bookmark");

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/v1/event/bookmark/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message);
      setIsBookmarked((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Failed to bookmark event");
    }
  };

  const handleRegister = () => {
    if (!currentUser) {
      toast.error("Please login to register");
      return;
    }
    if (event.registrationLink) {
      window.open(event.registrationLink, "_blank");
    } else {
      toast.success("Registration feature coming soon!");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: event.description,
          url: url,
        })
        .catch((err) => console.error(err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF9F2]">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm sm:text-base">Loading event...</p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FAF9F2]">
        <div className="text-center">
          <p className="text-gray-500 text-base sm:text-lg mb-4">
            Event not found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F2] ml-0 sm:ml-64">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm sm:text-base">Back</span>
        </button>

        {/* Event Card */}
        <div className="bg-[#FAF9F2] rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Event Image */}
          {event.image && (
            <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden rounded-xl bg-[#FAF9F2]">
              {/* Main image (sharp) */}
              <img
                src={event.image?.replace(
                  "/upload/",
                  "/upload/w_800,h_600,c_fit,q_auto/"
                )}
                alt={event.title || "Event"}
                className="relative z-10 w-full h-full object-contain "
              />

              {/* Type Badge */}
              {event.type && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-medium rounded-full shadow-md">
                    {event.type}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              {event.title || "Event Title"}
            </h1>

            {/* Category */}
            {event.category && (
              <div className="mb-4 sm:mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                  {event.category}
                </span>
              </div>
            )}

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Date */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#F0EFE9] rounded-xl">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Date
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Time */}
              {event.time && (
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#F0EFE9] rounded-xl">
                  <Clock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Time
                    </p>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">
                      {event.time}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#F0EFE9] rounded-xl sm:col-span-2">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Location
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 font-semibold break-words">
                    {event.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
              <button
                onClick={handleRegister}
                className="flex-1 sm:flex-initial bg-[#FB432C] hover:bg-[#f52a10] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                {event.registrationLink ? "Register Now" : "Register"}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95 text-sm sm:text-base ${
                  isBookmarked
                    ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                    : "bg-[#F0EFE9] text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </span>
                <span className="sm:hidden">
                  {isBookmarked ? "Saved" : "Save"}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#F0EFE9] text-gray-700 border-2 border-gray-300 hover:bg-gray-200 transition-all shadow-sm hover:shadow-md active:scale-95 text-sm sm:text-base"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-5 sm:pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                About this event
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || "No description available."}
              </p>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="border-t border-gray-200 mt-5 sm:mt-6 pt-5 sm:pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {event.organizer[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Organized by
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {event.organizer}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="border-t border-gray-200 mt-5 sm:mt-6 pt-5 sm:pt-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#F0EFE9] hover:bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-full transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats (Optional - if you have likes/attendees data) */}
            {event.likes && (
              <div className="border-t border-gray-200 mt-5 sm:mt-6 pt-5 sm:pt-6">
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">
                      <strong className="text-gray-900">
                        {event.likes?.length || 0}
                      </strong>{" "}
                      interested
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 px-4">
          <p>© 2025 Event Platform · Terms & Conditions · Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
