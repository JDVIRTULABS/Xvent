import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { FiCalendar, FiUsers, FiUser, FiEdit3, FiFileText } from "react-icons/fi";
import { BsTicketPerforated, BsBookmark } from "react-icons/bs";




const MyProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("events");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [myEvents, setMyEvents] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const userRes = await api.get("/user/me", {
        withCredentials: true,
      });
      setUser(userRes.data.user);
      setBio(userRes.data.user.bio || "");
      setGender(userRes.data.user.gender || "");
      setFollowers(userRes.data.user.followers || []);
      setFollowing(userRes.data.user.following || []);

      // Fetch user's events
      const eventsRes = await api.get("/event/userevent/all", {
        withCredentials: true,
      });
      setMyEvents(eventsRes.data.events || []);

      // Fetch user's posts
      const postsRes = await api.get("/post/userpost/all", {
        withCredentials: true,
      });
      setMyPosts(postsRes.data.posts || []);

      // Fetch bookmarked events (from user bookmarks)
      const bookmarksRes = await api.get("/user/bookmarks", {
        withCredentials: true,
      });
      setBookmarkedEvents(bookmarksRes.data.bookmarks || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("gender", gender);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      const res = await api.post(
        "/user/profile/edit",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser(res.data.user);
      setBio(res.data.user.bio || "");
      setGender(res.data.user.gender || "");
      setShowEdit(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post(
        "/user/resend-verification",
        { email: user.email }
      );
      alert("Verification email sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send verification email");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.post(
        `/user/followorunfollow/${userId}`,
        {},
        { withCredentials: true }
      );
      setFollowing(following.filter(u => u._id !== userId));
      alert("Unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Failed to unfollow user");
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get(
        `/user/${user._id}/following`,
        { withCredentials: true }
      );
      setFollowing(res.data.following || []);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                alt={user.username}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-purple-200 object-cover shadow-md"
              />
              {user.verified && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 sm:p-1.5 border-2 sm:border-4 border-white">
                  <AiOutlineCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{user.username}</h1>
                <button
                  onClick={() => setShowEdit(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  <FiEdit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Edit Profile
                </button>
              </div>

              <p className="text-sm sm:text-base text-gray-600 mb-2">{user.email}</p>

              {/* Verification Badge */}
              {!user.verified && (
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-3 justify-center md:justify-start">
                  <span className="text-orange-600 font-medium flex items-center gap-1 text-xs sm:text-sm">
                    <AiOutlineCloseCircle className="w-4 h-4" />
                    Email Not Verified
                  </span>
                  <button
                    onClick={handleResendVerification}
                    className="px-2 sm:px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs sm:text-sm font-medium transition"
                  >
                    Resend Email
                  </button>
                </div>
              )}

              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 max-w-xl">{user.bio || "No bio added yet. Tell others about yourself!"}</p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4 justify-center md:justify-start">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-purple-700">{myEvents.length}</p>
                  <p className="text-xs sm:text-sm text-purple-600">Events</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-pink-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-pink-700">{myPosts.length}</p>
                  <p className="text-xs sm:text-sm text-pink-600">Posts</p>
                </div>
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="bg-gradient-to-br from-blue-100 to-blue-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-md transition"
                >
                  <p className="text-lg sm:text-2xl font-bold text-blue-700">{followers.length}</p>
                  <p className="text-xs sm:text-sm text-blue-600">Followers</p>
                </button>
                <button
                  onClick={() => {
                    setShowFollowingModal(true);
                    fetchFollowing();
                  }}
                  className="bg-gradient-to-br from-green-100 to-green-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-md transition"
                >
                  <p className="text-lg sm:text-2xl font-bold text-green-700">{following.length}</p>
                  <p className="text-xs sm:text-sm text-green-600">Following</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 font-semibold transition flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-base ${
                activeTab === "events"
                  ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">My Events</span>
              <span className="sm:hidden">Events</span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 font-semibold transition flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-base ${
                activeTab === "posts"
                  ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">My Posts</span>
              <span className="sm:hidden">Posts</span>
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 font-semibold transition flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap text-xs sm:text-base ${
                activeTab === "bookmarks"
                  ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BsBookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              Bookmarks
            </button>
          </div>

          {/* Content Area */}
          <div className="p-3 sm:p-6">
            {activeTab === "events" && (
              <div>
                {myEvents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {myEvents.map((event) => (
                      <div
                        key={event._id}
                        className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg hover:border-purple-300 transition cursor-pointer"
                      >
                        <img
                          src={event.image || "https://via.placeholder.com/400x200?text=Event"}
                          alt={event.title}
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div className="p-3 sm:p-4">
                          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 sm:mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{event.description?.substring(0, 80)}...</p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600">
                            <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {event.date ? new Date(event.date).toLocaleDateString() : "No date"}
                          </div>
                          <div className="flex items-center gap-3 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                            <span>❤️ {event.likes?.length || 0}</span>
                            <span>💬 {event.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <FiCalendar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Events Created</h3>
                    <p className="text-sm sm:text-base text-gray-500">Start creating events to share with others!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div>
                {myPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {myPosts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg hover:border-pink-300 transition cursor-pointer"
                      >
                        <img
                          src={post.image || "https://via.placeholder.com/400x200?text=Post"}
                          alt={post.caption}
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-3">{post.caption?.substring(0, 100)}...</p>
                          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                            <span>❤️ {post.likes?.length || 0}</span>
                            <span>💬 {post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <FiFileText className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Posts Yet</h3>
                    <p className="text-sm sm:text-base text-gray-500">Share your thoughts and moments with posts!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookmarks" && (
              <div>
                {bookmarkedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {bookmarkedEvents.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition cursor-pointer"
                      >
                        <img
                          src={item.image || "https://via.placeholder.com/400x200?text=Bookmark"}
                          alt={item.title || item.caption}
                          className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div className="p-3 sm:p-4">
                          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 sm:mb-2 line-clamp-1">
                            {item.title || item.caption?.substring(0, 50)}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description?.substring(0, 80)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <BsBookmark className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Bookmarks</h3>
                    <p className="text-sm sm:text-base text-gray-500">Save events and posts to view them later!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold">Edit Profile</h3>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={user.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                    alt={user.username}
                    className="w-28 h-28 rounded-full border-4 border-purple-200 object-cover"
                  />
                  <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition">
                    <FiEdit3 className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      onChange={(e) => setProfilePicture(e.target.files[0])}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                  rows="4"
                  maxLength="200"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Followers
              </h3>
              <button onClick={() => setShowFollowersModal(false)} className="text-2xl hover:text-gray-200">
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {followers.length > 0 ? (
                <div className="space-y-3">
                  {followers.map((follower) => (
                    <div key={follower._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <img
                          src={follower.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                          alt={follower.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{follower.username}</p>
                          <p className="text-gray-500 text-sm">{follower.bio?.substring(0, 30) || "No bio"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiUsers className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold">No followers yet</p>
                  <p className="text-sm">Share your profile to gain followers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Following
              </h3>
              <button onClick={() => setShowFollowingModal(false)} className="text-2xl hover:text-gray-200">
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {following.length > 0 ? (
                <div className="space-y-3">
                  {following.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.bio?.substring(0, 30) || "No bio"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiUser className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold">Not following anyone yet</p>
                  <p className="text-sm">Discover and follow event creators</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;