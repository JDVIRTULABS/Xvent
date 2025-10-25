import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bookmark,
  CalendarDays,
  MapPin,
  Heart,
  MessageCircle,
  Send,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CommentWithReplies from "./CommentWithReplies";
import { useUser } from "../Context/UserContext";


const useNavigate = () => (path) => console.log("Navigate to:", path);
const toast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
};

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

const EventsPage = () => {
  const { currentUser } = useUser();
  const currentUserId = currentUser?._id;
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("recommended");
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({}); // For nested replies
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({}); // Track which comments have expanded replies
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({}); // Track reply input for each comment
  const [needsMoreInteractions, setNeedsMoreInteractions] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await api.get("/event/all");
      setEvents(res.data.events || []);
      setBookmarkedEvents(res.data.bookmarks || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load events");
    }
  };

  // Fetch recommended events
  const fetchRecommendedEvents = async () => {
    if (!currentUserId) return;

    try {
      const res = await api.get("/event/recommended");
      setRecommendedEvents(res.data.events || []);

      if (!res.data.interests || res.data.interests.length === 0) {
        setNeedsMoreInteractions(true);
        setFilterType("all");
      } else {
        setNeedsMoreInteractions(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recommended events");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchRecommendedEvents()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Handle likes
  const handleLikeToggle = async (event) => {
    if (!currentUserId) return toast.error("Please login to like events");

    const isLiked = event.likes?.includes(currentUserId);

    try {
      setEvents((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? {
                ...e,
                likes: isLiked
                  ? e.likes.filter((id) => id !== currentUserId)
                  : [...(e.likes || []), currentUserId],
              }
            : e
        )
      );
      setRecommendedEvents((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? {
                ...e,
                likes: isLiked
                  ? e.likes.filter((id) => id !== currentUserId)
                  : [...(e.likes || []), currentUserId],
              }
            : e
        )
      );

      await api.post(`/event/${event._id}/${isLiked ? "dislike" : "like"}`);
      fetchRecommendedEvents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update like");
      fetchEvents();
      fetchRecommendedEvents();
    }
  };


   // Set followedUsers on page load / when currentUser changes
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await api.get(`/user/${currentUser._id}/following`);
        if (res.data.success) {
          // res.data.following should be an array of user IDs
          setFollowedUsers(res.data.following);
        }
      } catch (err) {
        console.error("Failed to fetch followed users:", err);
      }
    };
    fetchFollowedUsers();
  }, [currentUser]);

  const handleFollowToggle = async (userId) => {
    if (!currentUser?._id) return toast.error("Please login to follow users");

    const isFollowing = followedUsers.includes(userId);

    // Optimistic update
    setFollowedUsers((prev) =>
      isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

    try {
      const res = await api.post(`/user/${userId}/follow`);
      if (!res.data.success) {
        // Revert optimistic update if backend fails
        setFollowedUsers((prev) =>
          isFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
        toast.error(res.data.message || "Failed to update follow status");
      } else {
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setFollowedUsers((prev) =>
        isFollowing ? [...prev, userId] : prev.filter((id) => id !== userId)
      );
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };



  // Handle bookmarks
  const handleBookmark = async (id) => {
    try {
      setBookmarkedEvents((prev) =>
        prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
      );
      await api.post(`/event/${id}/bookmark`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to bookmark event");
      setBookmarkedEvents((prev) =>
        prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
      );
    }
  };

  // Handle main comments
  const handleComment = async (event) => {
    const text = commentInputs[event._id]?.trim();
    if (!text) return toast.error("Comment cannot be empty");
    if (!currentUserId) return toast.error("Please login to comment");

    try {
      const res = await api.post(`/event/${event._id}/comment`, { text });
      toast.success("Comment added!");
      setCommentInputs((prev) => ({ ...prev, [event._id]: "" }));
      setShowCommentInput((prev) => ({ ...prev, [event._id]: false }));

      setEvents((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? { ...e, comments: [...(e.comments || []), res.data.comment] }
            : e
        )
      );
      setRecommendedEvents((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? { ...e, comments: [...(e.comments || []), res.data.comment] }
            : e
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  // Handle nested replies
  // const handleReply = async (eventId, commentId) => {
  //   const text = replyInputs[commentId]?.trim();
  //   if (!text) return toast.error("Reply cannot be empty");
  //   if (!currentUserId) return toast.error("Please login to reply");

  //   try {
  //     const res = await api.post(
  //       `/event/${eventId}/comment/${commentId}/reply`,
  //       { text }
  //     );

  //     toast.success("Reply added!");
  //     setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
  //     setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));

  //     // Update the comment with the new reply
  //     const updateEventComments = (events) =>
  //       events.map((e) => {
  //         if (e._id === eventId) {
  //           return {
  //             ...e,
  //             comments: e.comments.map((c) =>
  //               c._id === commentId
  //                 ? { ...c, replies: [...(c.replies || []), res.data.reply] }
  //                 : c
  //             ),
  //           };
  //         }
  //         return e;
  //       });

  //     setEvents(updateEventComments);
  //     setRecommendedEvents(updateEventComments);
  //     setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to add reply");
  //   }
  // };

  const handleViewDetails = (id) => navigate(`/event/${id}`);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedEventType("all");
    setDateFilter("all");
    setSortBy("date");
  };

  // Get unique categories from events
  const categories = [
    ...new Set(events.map((e) => e.category).filter(Boolean)),
  ];

  // Filter and Search Logic
  const getFilteredEvents = () => {
    let displayEvents =
      filterType === "recommended" ? recommendedEvents : events;

    if (searchQuery) {
      displayEvents = displayEvents.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCategory !== "all") {
      displayEvents = displayEvents.filter(
        (event) => event.category === selectedCategory
      );
    }

    if (selectedEventType !== "all") {
      displayEvents = displayEvents.filter(
        (event) => event.type === selectedEventType
      );
    }

    const now = new Date();
    if (dateFilter === "today") {
      displayEvents = displayEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      displayEvents = displayEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= weekFromNow;
      });
    } else if (dateFilter === "month") {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      displayEvents = displayEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= monthFromNow;
      });
    }

    if (sortBy === "date") {
      displayEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "likes") {
      displayEvents.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    } else if (sortBy === "recent") {
      displayEvents.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return displayEvents;
  };

  const displayEvents = getFilteredEvents();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F2]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F2] py-4 sm:py-6 px-3 sm:px-4 lg:px-8 ml-0 sm:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header with Toggle */}
        <div className="mb-4 sm:mb-6">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
            Discover Events
          </h1> */}

          <div className="flex justify-center gap-2 sm:gap-3 mb-4">
            <button
              className={`px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base transition-all ${
                filterType === "all"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterType("all")}
            >
              All Events
            </button>
            <button
              className={`px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base transition-all ${
                filterType === "recommended"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterType("recommended")}
              disabled={needsMoreInteractions}
            >
              For You
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, location, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory !== "all" ||
                selectedEventType !== "all" ||
                dateFilter !== "all" ||
                sortBy !== "date") && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            {(selectedCategory !== "all" ||
              selectedEventType !== "all" ||
              dateFilter !== "all" ||
              sortBy !== "date" ||
              searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 bg-white border border-gray-300 rounded-xl p-4 space-y-4 shadow-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategory === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedCategory === cat
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {["all", "In-Person", "Online", "Hybrid"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedEventType(type)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedEventType === type
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {type === "all" ? "All Types" : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  When
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Dates" },
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDateFilter(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        dateFilter === opt.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "date", label: "Date" },
                    { value: "likes", label: "Most Liked" },
                    { value: "recent", label: "Recently Added" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        sortBy === opt.value
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {displayEvents.length} event
            {displayEvents.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayEvents.length === 0 ? (
            <div className="col-span-full text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No Events Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                Try adjusting your filters or search query
              </p>
              {(selectedCategory !== "all" ||
                selectedEventType !== "all" ||
                dateFilter !== "all" ||
                searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            displayEvents.map((event) => {
              const isLiked = event.likes?.includes(currentUserId);
              const totalComments = event.comments?.length || 0;
              const authorId = event.author?._id; 
              const commentsToShow = expandedComments[event._id]
                ? event.comments
                : event.comments?.slice(-1) || [];

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col border border-gray-200 h-fit"
                >
                  {/* User Header */}
                  <div className="p-3 sm:p-4 pb-3 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {(event.authorUsername ||
                        event.organizer ||
                        "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {event.authorUsername || event.organizer || "UserName"}
                      </h3>
                    </div>
                     <div className="ml-auto">
                      {authorId && authorId !== currentUserId && (
                        <button
                          onClick={() => handleFollowToggle(authorId)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            followedUsers.includes(authorId)
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          {followedUsers.includes(authorId)
                            ? "Unfollow"
                            : "Follow"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {event.image && (
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={event.title || "Event Image"}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover cursor-pointer"
                        onClick={() => handleViewDetails(event._id)}
                      />
                      {event.type && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full">
                          {event.type}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="p-3 sm:p-4">
                    <h2
                      className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => handleViewDetails(event._id)}
                    >
                      {event.title || "No Title"}
                    </h2>

                    {event.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                        {event.category}
                      </span>
                    )}

                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {event.venue || "No Location"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 py-2 sm:py-3 border-t border-gray-200">
                      <button
                        onClick={() => handleLikeToggle(event)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                          isLiked
                            ? "bg-red-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span>{event.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() =>
                          setShowCommentInput((prev) => ({
                            ...prev,
                            [event._id]: !prev[event._id],
                          }))
                        }
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{totalComments}</span>
                      </button>

                      <button
                        onClick={() => handleBookmark(event._id)}
                        className={`ml-auto p-1.5 sm:p-2 rounded-full transition-all ${
                          bookmarkedEvents.includes(event._id)
                            ? "bg-blue-500 hover:bg-blue-600 shadow-md"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            bookmarkedEvents.includes(event._id)
                              ? "text-white fill-white"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Comment Input */}
                    {showCommentInput[event._id] && (
                      <div className="flex items-center gap-2 mt-3 pb-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInputs[event._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [event._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleComment(event);
                            }
                          }}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleComment(event)}
                          className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
                        >
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}

                    {/* Comments Section */}
                    {totalComments > 0 && (
                      <div className="mt-3">
                        {/* View all comments toggle */}
                        {totalComments > 2 && (
                          <button
                            className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                            onClick={() =>
                              setExpandedComments((prev) => ({
                                ...prev,
                                [event._id]: !prev[event._id],
                              }))
                            }
                          >
                            {expandedComments[event._id] ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide comments
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View all {totalComments} comments
                              </>
                            )}
                          </button>
                        )}

                        {/* Comments List */}
                        {commentsToShow.map((comment) => (
                          <CommentWithReplies
                            key={comment._id}
                            comment={comment}
                            eventId={event._id}
                            updateComments={(parentId, newReply) => {
                              const updateRecursive = (comments) =>
                                comments.map((c) => {
                                  if (c._id === parentId) {
                                    return {
                                      ...c,
                                      replies: [...(c.replies || []), newReply],
                                    };
                                  }
                                  if (c.replies)
                                    return {
                                      ...c,
                                      replies: updateRecursive(c.replies),
                                    };
                                  return c;
                                });

                              setEvents((prev) =>
                                prev.map((e) =>
                                  e._id === event._id
                                    ? {
                                        ...e,
                                        comments: updateRecursive(e.comments),
                                      }
                                    : e
                                )
                              );

                              setRecommendedEvents((prev) =>
                                prev.map((e) =>
                                  e._id === event._id
                                    ? {
                                        ...e,
                                        comments: updateRecursive(e.comments),
                                      }
                                    : e
                                )
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
