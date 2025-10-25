import React, { useEffect, useState } from "react";
import axios from "axios";
import Footer from "./Footer";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/event/public`);
        setEvents(res.data.events);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicEvents();
  }, []);

  const handleExploreClick = () => {
    const eventsSection = document.getElementById("events-section");
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleJoinUsClick = () => {
    window.location.href = "/signup";
  };

  const handleEventDetails = (eventId) => {
    window.location.href = `/event/${eventId}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full bg-black text-[#FAF9F2] flex flex-col items-center rounded-2xl justify-center py-20 md:py-28 px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Discover Events.<br />
            Meet People.<br />
            Join Communities.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-8 text-gray-300 font-light">
            Xvent is where college events, meetups, and experiences come together — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExploreClick}
              className="bg-white text-black px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Explore Events
            </button>
            <button
              onClick={handleJoinUsClick}
              className="bg-[#E6684F] text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-[#E6684F]/80 transition-all shadow-lg"
            >
              Join Us
            </button>
          </div>
        </section>

        {/* Feature Section */}
        <div className="flex flex-col items-center justify-center text-center my-20 px-6 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Discover and Create<br />
            Unforgettable Experiences
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            We empower you to explore a variety of events tailored to your interests. From lively college fests to intimate meetups, there's something for everyone.
          </p>
        </div>

        {/* Events Section */}
        <div id="events-section" className="w-full flex flex-col items-center my-16 px-6 bg-[#FAF9F2] py-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-12 text-center">Browse Upcoming Events</h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading events...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="bg-gray-200 w-full h-52 flex items-center justify-center overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                        {event.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h4 className="font-bold text-xl mb-2 text-gray-900 leading-snug">
                      {event.title}
                    </h4>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex gap-4">
                        <button className="text-gray-300 hover:text-red-400 transition-colors" title="Login to like">❤️</button>
                        <button className="text-gray-300 hover:text-gray-600 transition-colors" title="Login to comment">💬</button>
                        <button
                          onClick={() =>
                            navigator.share
                              ? navigator.share({
                                  title: event.title,
                                  text: "Check out this event on Xvent!",
                                  url: `${window.location.origin}/event/${event._id}`,
                                })
                              : alert("Sharing not supported on this browser")
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Share event"
                        >
                          🔗
                        </button>
                      </div>
                      <button
                        onClick={() => handleEventDetails(event._id)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
