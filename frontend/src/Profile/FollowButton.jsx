import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner"; // Optional if you're using toast notifications
import { useUser } from "../Context/UserContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

const FollowButton = ({ userId }) => {
  const { currentUser } = useUser();
  const currentUserId = currentUser?._id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial follow status
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!currentUserId || !userId) return;
      try {
        const res = await api.get(`/user/${currentUserId}/following`);
        if (res.data.success) {
          setIsFollowing(res.data.following.includes(userId));
        }
      } catch (err) {
        console.error("Failed to fetch follow status:", err);
      }
    };

    fetchFollowStatus();
  }, [currentUserId, userId]);

  const handleFollowToggle = async () => {
    if (!currentUserId) return toast.error("Please login to follow users");
    setLoading(true);

    // Optimistic UI
    setIsFollowing((prev) => !prev);

    try {
      const res = await api.post(`/user/${userId}/follow`);
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        setIsFollowing((prev) => !prev); // revert on failure
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setIsFollowing((prev) => !prev);
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  if (userId === currentUserId) return null; // hide follow button for self

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
        isFollowing
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
