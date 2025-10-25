import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "../Context/UserContext";
import { Loader2, Image, Camera } from "lucide-react";
import { PlusSquare, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/Post/PostCard";

const Dashboard = () => {
  const { currentUser } = useUser();
  const currentUserId = currentUser?._id;
  const navigate = useNavigate();

  // Feed
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mode To change Post AND event
  const [mode, setMode] = useState("post");

  // Post Form
  const [caption, setCaption] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [postLoading, setPostLoading] = useState(false);

  // Event Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("In-Person");
  const [tags, setTags] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [eventImage, setEventImage] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/post/all", {
        withCredentials: true,
      });
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  //Post Handler
  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    setPostImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postImage) {
      toast.error("Please select an image");
      return;
    }
    try {
      setPostLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", postImage);

      const res = await axios.post("http://localhost:8000/api/v1/post/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("✅ Post created successfully!");
        setCaption("");
        setPostImage(null);
        setPostImagePreview(null);
        setPosts(prev => [res.data.post, ...prev]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "❌ Failed to add post");
    } finally {
      setPostLoading(false);
    }
  };

  // Event Handler
  const handleEventImageChange = (e) => setEventImage(e.target.files[0]);

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (!eventImage || !title || !venue || !date || !time || !category || !organizer) {
      toast.error("Please fill all required fields and select an image");
      return;
    }

    try {
      setEventLoading(true);
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("venue", venue);
      formData.append("organizer", organizer);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("category", category);
      formData.append("type", type);
      tagsArray.forEach((tag) => formData.append("tags[]", tag));
      formData.append("registrationLink", registrationLink);
      formData.append("image", eventImage);

      const res = await axios.post("http://localhost:8000/api/v1/event/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("✅ Event created successfully!");
        setTitle(""); setDescription(""); setVenue(""); setOrganizer(""); setDate("");
        setTime(""); setCategory(""); setType("In-Person"); setTags(""); setRegistrationLink(""); setEventImage(null);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "❌ Failed to create event");
    } finally {
      setEventLoading(false);
    }
  };

  const handleLikeToggle = async (postId, isLiked) => {
    if (!currentUserId) return toast.error("Please login to like posts");
    try {
      setPosts(prev =>
        prev.map(post =>
          post._id === postId
            ? { ...post, likes: isLiked ? post.likes.filter(id => String(id) !== String(currentUserId)) : [...post.likes, currentUserId] }
            : post
        )
      );
      const endpoint = isLiked ? "dislike" : "like";
      await axios.put(`http://localhost:8000/api/v1/post/${postId}/${endpoint}`, {}, { withCredentials: true });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      fetchPosts();
    }
  };

  const handleShare = (post) => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      navigator.share({ title: post.caption || "Check this out!", text: post.caption || "", url }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard!");
    }
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F2] ml-0 sm:ml-64">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Toggle Buttons */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button 
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all ${
              mode === "post" 
                ? "bg-gray-900 text-white shadow-md" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setMode("post")}
          >
            <PlusSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Post</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all ${
              mode === "event" 
                ? "bg-gray-900 text-white shadow-md" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setMode("event")}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Event</span>
          </button>
        </div>

        {/* POST FORM */}
        {currentUser && mode === "post" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-start gap-3">
              <img
                src={currentUser?.profilePicture || "/default-profile.png"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <form onSubmit={handlePostSubmit} className="space-y-4 flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  placeholder="What's on your mind?"
                  className="w-full flex-1 resize-none border-none px-0 py-2 text-sm sm:text-base focus:ring-0 focus:outline-none overflow-hidden bg-transparent text-gray-800 placeholder-gray-400"
                  rows={1}
                />
                
                {postImagePreview && (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={postImagePreview} alt="Preview" className="w-full h-auto max-h-96 object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => {
                        setPostImage(null);
                        setPostImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-[#FB432C] transition px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Image className="w-5 h-5" />
                    <span className="text-sm font-medium">Photo</span>
                    <input type="file" accept="image/*" onChange={handlePostImageChange} className="hidden" />
                  </label>
                  
                  {postLoading ? (
                    <button disabled className="bg-[#FB432C] text-white py-2 px-6 rounded-full flex items-center justify-center text-sm font-medium">
                      <Loader2 className="animate-spin mr-2 w-4 h-4" />
                      Posting...
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="bg-[#FB432C] hover:bg-[#FB432C]/90 text-white py-2 px-6 rounded-full font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!postImage}
                    >
                      Post
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EVENT FORM */}
        {currentUser && mode === "event" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Create Event</h2>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event Title"
                className="w-full border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                required
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C] resize-none"
                rows={2}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                  required
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Venue"
                  className="flex-1 border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                  required
                />
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Organizer"
                  className="flex-1 border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                  required
                />
              </div>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g., Tech, Startup, Business)"
                className="w-full border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
                required
              />

              <div>
                <p className="text-sm text-gray-600 mb-2">Event Type</p>
                <div className="flex gap-2">
                  {["In-Person", "Online", "Hybrid"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setType(opt)}
                      className={`flex-1 py-2 text-sm font-medium rounded-full transition ${
                        type === opt
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
              />
              <input
                type="url"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="Registration Link (optional)"
                className="w-full border-b border-gray-300 bg-transparent p-2 text-sm sm:text-base focus:outline-none focus:border-[#FB432C]"
              />

              <label className="flex items-center gap-2 p-3 cursor-pointer text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <Camera className="w-5 h-5" />
                <span className="text-sm">
                  {eventImage ? eventImage.name : "Upload Event Banner"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventImageChange}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                className="w-full bg-[#FB432C] hover:bg-[#FB432C]/90 text-white py-2.5 rounded-full font-medium text-sm transition"
                disabled={eventLoading}
              >
                {eventLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                    Publishing...
                  </span>
                ) : (
                  "Publish Event"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Feed Starts */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin w-8 h-8 mx-auto text-gray-500" />
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading posts...</p>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 text-sm sm:text-base">No posts available yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:gap-6">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              currentUser={currentUser}
              handleLikeToggle={handleLikeToggle}
              handleShare={handleShare}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;