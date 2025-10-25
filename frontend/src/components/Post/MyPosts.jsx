import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
   
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/v1/post/userpost/all`,
        { withCredentials: true }
      );
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching my posts:", error);
      toast.error("Failed to fetch posts");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/post/delete/${postId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Post deleted successfully!");
        setPosts((prev) => prev.filter((post) => post._id !== postId));
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Posts</h2>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">You haven’t created any posts yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="border-none rounded-xl p-4 shadow bg-[#F0EFE9]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author?.profilePicture || "/default-profile.png"}
  alt={post.author?.username || "profile"}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold">{post.author?.username || "Unknown"}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/post/updated/${post._id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Edit2 size={16} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>

              {post.image && (
                <img
               src={post.image}
    alt={post.caption || "post"}
                  className="w-full rounded-lg mb-2 "
                />
              )}

              <p className="text-gray-700">{post.caption}</p>
              <p className="text-sm text-gray-500">
                {post.likes?.length || 0} Likes • {post.comments?.length || 0} Comments
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
