import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
// Deft Avatar
  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"; 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/${id}/profile`,
          { withCredentials: true }
        );
        setUser(res.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-10 text-lg font-medium text-gray-600">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="text-center mt-10 text-lg font-semibold text-red-500">
        User not found 
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Card */}
      <div className="flex items-center gap-6 mb-10 bg-white rounded-2xl shadow-md p-6">
        <img
          src={user.profilePicture || defaultAvatar}
          alt={user.username}
          className="w-28 h-28 rounded-full border-4 border-gray-200 shadow-md object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {user.username}
          </h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="mt-2 text-gray-700 italic">
            {user.bio || "This user hasn’t written a bio yet."}
          </p>
          <div className="flex gap-6 mt-4 text-sm font-medium text-gray-600">
            <span>👥 Followers: {user.followers.length}</span>
            <span>➡️ Following: {user.following.length}</span>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 border-b pb-2">Posts</h3>
        {user.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.posts.map((post) => (
              <div
                key={post._id}
                className="p-5 border rounded-2xl shadow-sm bg-white hover:shadow-md transition"
              >
                <h4 className="font-bold text-lg text-gray-800">
                  {post.title || "Untitled Post"}
                </h4>
                <p className="text-gray-600 mt-2">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No posts yet.</p>
        )}
      </div>

      {/* Events Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 border-b pb-2">🎉 Events</h3>
        {user.events.length > 0 ? (
          <ul className="space-y-4">
            {user.events.map((event) => (
              <li
                key={event._id}
                className="p-5 border rounded-2xl shadow-sm bg-white hover:shadow-md transition"
              >
                <h4 className="font-bold text-lg text-gray-800">
                  {event.name}
                </h4>
                <p className="text-gray-600">
                  📅 {new Date(event.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No events yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
