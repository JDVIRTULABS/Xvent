import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "../Context/UserContext";
import { Loader2, Calendar, MapPin, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookmarksPage = () => {
  const { currentUser } = useUser();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, [currentUser]);

 const fetchBookmarks = async () => {
  if (!currentUser?._id) return;
  setLoading(true);
  try {
    const { data } = await axios.get("http://localhost:8000/api/v1/user/bookmarks", {
      withCredentials: true,
    });
    setBookmarks(data.bookmarks || []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch bookmarks");
  } finally {
    setLoading(false); // <- important!
  }
};


  const handleViewDetails = (id) => {
    navigate(`/event/${id}`);
  };

  const handleRemoveBookmark = async (id) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/user/bookmark/${id}`,
        {},
        { withCredentials: true }
      );
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Bookmark removed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove bookmark");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );

  if (!bookmarks.length)
    return <p className="text-center text-gray-500 mt-10">No bookmarks found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Bookmarks</h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 justify-items-center">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark._id}
            className="bg-[#FAF9F2] w-60 h-[349px] rounded-xl border border-[#E1E1DA] p-4 flex flex-col justify-between transition shadow"
          >
            {bookmark.image && (
              <img
                src={bookmark.image}
                alt={bookmark.title || "Event"}
                className="w-full h-44 object-cover rounded-md mt-3"
              />
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 break-words">
                {bookmark.title || "Title"}
              </h2>
              <p className="text-sm text-gray-600 mb-2">{bookmark.category || "#general"}</p>

              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 opacity-50" />
                <p className="text-sm pl-2 text-gray-600">{bookmark.venue}</p>
              </div>

              <div className="flex items-center text-gray-500 text-xs gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(bookmark.date)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")
                    .toLowerCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleRemoveBookmark(bookmark._id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                >
                  <Bookmark className="w-4 h-4" /> Remove
                </button>

                <button
                  onClick={() => handleViewDetails(bookmark._id)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPage;
