import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({
    username: "",
    bio: "",
    gender: "",
  });
  const [file, setFile] = useState(null);

  const API =
    import.meta.env.VITE_API_URL || `${BACKEND_URL}/api/v1/user`;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/me`, { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user);
          setForm({
            username: res.data.user.username || "",
            bio: res.data.user.bio || "",
            gender: res.data.user.gender || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("bio", form.bio);
      formData.append("gender", form.gender);
      if (file) formData.append("profilePicture", file);

      const res = await axios.post(`${API}/profile/edit`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setUser(res.data.user);
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile Update Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.get(`${API}/logout`, { withCredentials: true });
      toast.success("Logged out");
      window.location.href = "/login";
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-white p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-10">Xvent</h2>
        <nav className="space-y-3">
          {["Home", "Discover Events", "Bookmarks", "Profile", "Settings"].map(
            (item) => (
              <button
                key={item}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  item === "Settings"
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {item}
              </button>
            )
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-8">Account Settings</h2>

        <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              value={form.username}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={user.email}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-gray-200"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-gray-200"
              rows={3}
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <img
                src={user.profilePicture || "/default-avatar.png"}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            {updating && <Loader2 className="animate-spin" size={16} />}
            Save Changes
          </button>
        </form>

        {/* Logout */}
        <div className="mt-10">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline flex items-center gap-1 text-sm"
          >
            <LogOut size={16} /> Logout Account
          </button>
        </div>
      </main>
    </div>
  );
}
