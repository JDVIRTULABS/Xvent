import React, { useState } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

// Toast fallback
const toast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
};

// Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
});

const CommentWithReplies = ({ comment, eventId, level = 0, updateComments }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState(false);

  const replyCount = comment.replies?.length || 0;

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");

    try {
      const res = await api.post(`/event/${eventId}/comment/${comment._id}/reply`, { text: replyText });
      toast.success("Reply added!");

      setReplyText("");
      setShowReplyInput(false);

      updateComments(comment._id, res.data.reply);
      setExpandedReplies(true); // auto-expand new reply
    } catch (err) {
      console.error(err);
      toast.error("Failed to add reply");
    }
  };

  return (
    <div style={{ marginLeft: `${level * 16}px` }} className="space-y-2">
      {/* Main Comment */}
      <div className="flex items-start gap-2 p-2 rounded-lg bg-[#F0EFE9] hover:bg-gray-100 transition-colors">
        {comment.user?.profilePicture ? (
          <img
            src={comment.user.profilePicture}
            alt={comment.user.username}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs text-white font-semibold flex-shrink-0">
            {comment.user?.username?.[0]?.toUpperCase() || "?"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-800">
            <span className="font-semibold">{comment.user?.username || "Unknown"}</span>{" "}
            <span className="text-gray-700">{comment.text}</span>
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              })}
            </p>
            <button
              onClick={() => setShowReplyInput((prev) => !prev)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reply
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setExpandedReplies((prev) => !prev)}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                {expandedReplies ? <><ChevronUp className="w-4 h-4 inline" /> Hide</> : <><ChevronDown className="w-4 h-4 inline" /> View {replyCount} {replyCount === 1 ? "reply" : "replies"}</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder={`Reply to ${comment.user?.username || "user"}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleReply();
              }
            }}
            className="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
            autoFocus
          />
          <button
            onClick={handleReply}
            className="p-1 sm:p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}

      {/* Nested Replies */}
      {replyCount > 0 && expandedReplies && (
        <div className="space-y-2 mt-1">
          {comment.replies.map((reply) => (
            <CommentWithReplies
              key={reply._id}
              comment={reply}
              eventId={eventId}
              level={level + 1}
              updateComments={updateComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentWithReplies;
