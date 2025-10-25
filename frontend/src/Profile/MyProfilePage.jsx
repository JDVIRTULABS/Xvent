import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

const MyProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [verified, setVerified] = useState(null);

  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/user/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
        setBio(res.data.user.bio || "");
        setGender(res.data.user.gender || "");
        setVerified(res.data.user.verified || "")
        console.log(res);
        
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, []);
console.log(verified);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("gender", gender);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/profile/edit",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser(res.data.user); // update state with latest
      setShowEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleResendVerification = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/user/resend-verification",
        { email: user.email }
      );
      alert("Verification email sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send verification email");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <img
          src={user.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
          alt={user.username}
          className="w-28 h-28 rounded-full border shadow"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.username}</h2>
          <p className="text-gray-600">{user.email}</p>

          {/* Verification Status */}
      

<div className="flex items-center gap-2 mt-1">
  {user.verified ? (
    <span className="text-green-600 font-semibold flex items-center gap-1">
      <AiOutlineCheckCircle className="w-4 h-4" />
      Verified
    </span>
  ) : (
    <>
      <span className="text-red-600 font-semibold flex items-center gap-1">
        <AiOutlineCloseCircle className="w-4 h-4" />
        Not Verified
      </span>
      <button
        onClick={handleResendVerification}
        className="ml-3 px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition"
      >
        Resend Email
      </button>
    </>
  )}
</div>


          <p className="mt-2">{user.bio || "No bio yet"}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-700">
            <span>Followers: {user.followers.length}</span>
            <span>Following: {user.following.length}</span>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Profile Picture</label>
                <input
                  type="file"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
