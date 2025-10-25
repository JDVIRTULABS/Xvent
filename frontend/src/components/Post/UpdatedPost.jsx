import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const UpdatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    // fetch existing post data
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/v1/post/${id}`, {
  withCredentials: true,
});

        setCaption(data.post.caption);
        setPreview(data.post.image);
      } catch (error) {
        toast.error("Failed to load post");
      }
    };
    fetchPost();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) formData.append("image", image);

    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/v1/post/update/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast.success("Post updated successfully!");
        navigate("/my-post"); // redirect back
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border rounded p-2"
          placeholder="Update caption"
        />
        {preview && <img src={preview} alt="preview" className="rounded" />}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Post
        </button>
      </form>
    </div>
  );
};

export default UpdatePost;
