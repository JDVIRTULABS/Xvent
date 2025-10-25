import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddEventPost = () => {
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
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !title || !venue || !date || !time || !category || !organizer) {
      toast.error("Please fill all required fields and select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("venue", venue);
      formData.append("organizer", organizer);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("tags", tags); // comma-separated string
      formData.append("registrationLink", registrationLink);
      formData.append("image", image);

      const res = await axios.post(
        "http://localhost:8000/api/v1/event/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("✅ Event created successfully!");
        setTitle("");
        setDescription("");
        setVenue("");
        setOrganizer("");
        setDate("");
        setTime("");
        setCategory("");
        setType("In-Person");
        setTags("");
        setRegistrationLink("");
        setImage(null);

        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "❌ Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create Event Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event Description"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows="3"
        />
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Venue"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
        <input
          type="text"
          value={organizer}
          onChange={(e) => setOrganizer(e.target.value)}
          placeholder="Organizer"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-1/2 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-1/2 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g., Music, Tech)"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="In-Person">In-Person</option>
          <option value="Online">Online</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="url"
          value={registrationLink}
          onChange={(e) => setRegistrationLink(e.target.value)}
          placeholder="Registration Link (optional)"
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded-lg p-2"
          required
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
            Post Event
          </button>
        )}
      </form>
    </div>
  );
};

export default AddEventPost;
