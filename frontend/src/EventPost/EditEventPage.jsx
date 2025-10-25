import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    organizer: "",
    category: "",
    type: "",
    tags: "",
    registrationLink: "",
    image: null ,
    imagePreview: "",
  });

  // Fetch event details
  const fetchEvent = async () => {
    try {
      const res = await api.get(`/event/${id}`);
      const event = res.data.event;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.split("T")[0] : "",
        time: event.time || "",
        venue: event.venue || "",
        organizer: event.organizer || "",
        category: event.category || "",
        type: event.type || "",
        tags: event.tags?.join(", ") || "",
        registrationLink: event.registrationLink || "",
        image: event.image ||null,
        imagePreview: event.image || "",
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch event");
      navigate("/myevents");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image" && key !== "imagePreview") {
        data.append(key, value);
      }
    });

    // Only append actual File
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    const res = await api.put(`/event/${id}/update`, data);
    const updatedEvent = res.data.event;

    setFormData(prev => ({
      ...prev,
      imagePreview: updatedEvent.image,
      image: null
    }));

    toast.success("Event updated successfully");
    navigate("/myevents");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update event");
  } finally {
    setSubmitting(false);
  }
};


console.log(formData);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F2]/90 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Event</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Update your event details and make it even more amazing
          </p>
        </div>

        <div className=" bg-[#FAF9F2]   shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Image preview section */}
          {formData.imagePreview && (
            <div className="relative flex justify-center">
              <div className="w-full max-w-md">
                <img
                  src={formData.imagePreview}
                  alt="Event preview"
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Form section */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Title & Description */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a compelling event title"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm  bg-[#FAF9F2] "
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event in detail..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white resize-vertical"
                    rows={5}
                    required
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  />
                </div>
              </div>

              {/* Venue & Organizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Where is your event happening?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizer
                  </label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    placeholder="Who is organizing this event?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  />
                </div>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Music">Music</option>
                    <option value="Tech">Tech</option>
                    <option value="Sports">Sports</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Arts">Arts</option>
                    <option value="Food">Food & Drink</option>
                    <option value="Health">Health & Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Tags & Registration Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tech, conference, networking (comma separated)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Link
                  </label>
                  <input
                    type="text"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleChange}
                    placeholder="https://example.com/register"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 shadow-sm bg-white"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Event Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/myevents")}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating Event...
                    </>
                  ) : (
                    "Update Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
