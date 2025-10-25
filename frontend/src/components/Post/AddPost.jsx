import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddPost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", image);

      const res = await axios.post(
        "http://localhost:8000/api/v1/post/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Post created successfully!");
        setCaption("");
        setImage(null);

        // Small delay so user sees alert
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to add post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="3"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded-lg p-2"
        />

        {loading ? (
          <button
            disabled
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <Loader2 className="animate-spin mr-2" /> Posting...
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition duration-200 text-white py-2 px-4 rounded-lg font-medium"
          >
            Post
          </button>
        )}
      </form>
    </div>
  );
};

export default AddPost;
