import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Send, MoreVertical, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import FollowButton from "../../Profile/FollowButton";
import DefaultLogo from "../../Profile/DefaultLogo";

const PostCard = ({ post, currentUserId, currentUser, handleLikeToggle, handleShare, onCommentAdded }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [postComments, setPostComments] = useState(post.comments || []);

  const isLiked = currentUserId && post.likes.some((id) => String(id) === String(currentUserId));


  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleComment = async (parentCommentId = null) => {
    const inputKey = parentCommentId || 'main';
    const text = commentInputs[inputKey]?.trim();
    
    if (!text) return toast.error("Comment cannot be empty");
    if (!currentUserId) return toast.error("Please login to comment");

    try {
      const payload = { text };
      if (parentCommentId) payload.parentCommentId = parentCommentId;
      
      const { data } = await axios.post(
        `${BACKEND_URL}/api/v1/post/${post._id}/comment`,
        payload,
        { withCredentials: true }
      );
      
      toast.success("Comment added!");
      setCommentInputs(prev => ({ ...prev, [inputKey]: "" }));
      setReplyingTo(null);
      setPostComments(prev => [...prev, data.comment]);
      
      if (onCommentAdded) {
        onCommentAdded(post._id, data.comment);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
    }
  };

  const handleReply = (commentId, username) => {
    setReplyingTo({ commentId, username });
    const inputKey = commentId;
    setCommentInputs(prev => ({ ...prev, [inputKey]: `@${username} ` }));
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const buildCommentTree = (comments) => {
    const commentMap = {};
    const roots = [];

    comments.forEach(comment => {
      commentMap[comment._id] = { ...comment, replies: [] };
    });

    comments.forEach(comment => {
      if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
        commentMap[comment.parentCommentId].replies.push(commentMap[comment._id]);
      } else {
        roots.push(commentMap[comment._id]);
      }
    });

    return roots;
  };

  const CommentItem = ({ comment, level = 0 }) => {
    const [showReplies, setShowReplies] = useState(true);
    const isReplying = replyingTo?.commentId === comment._id;
    const inputKey = comment._id;

    return (
      <div className={`${level > 0 ? 'ml-6 sm:ml-10 mt-3' : 'mt-3'}`}>
        <div className="flex gap-2 sm:gap-3">
          {comment.author?.profilePicture ? (
          <img
            src={comment.author?.profilePicture || "/default-profile.png"}
            alt={comment.author?.username}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
          />) : (<DefaultLogo user={comment.author} />)}
          <div className="flex-1 min-w-0">
            <div className="bg-[#F0EFE9] rounded-2xl px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm text-gray-900">
                  {comment.author?.username || "Unknown"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                
              </div>
              <p className="text-xs sm:text-sm text-gray-800 mt-1 break-words">{comment.text}</p>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 mt-1 ml-3">
              <button
                onClick={() => handleReply(comment._id, comment.author?.username)}
                className="text-xs font-medium text-gray-600 hover:text-[#FB432C] transition"
              >
                Reply
              </button>
              {comment.replies?.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs font-medium text-gray-600 hover:text-[#FB432C] transition flex items-center gap-1"
                >
                  {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                  <span className="sm:hidden">{comment.replies.length}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="ml-8 sm:ml-10 mt-2 flex gap-2">
            <input
              type="text"
              value={commentInputs[inputKey] || ""}
              onChange={(e) => setCommentInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
              placeholder="Write a reply..."
              className="flex-1 bg-[#F0EFE9] rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FB432C]/20"
              onKeyPress={(e) => e.key === 'Enter' && handleComment(comment._id)}
            />
            <button
              onClick={() => handleComment(comment._id)}
              className="bg-[#FB432C] text-white rounded-full p-2 hover:bg-[#FB432C]/90 transition flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={cancelReply}
              className="text-gray-600 hover:text-gray-800 p-2 flex-shrink-0"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {showReplies && comment.replies?.length > 0 && (
          <div className="mt-1">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const commentTree = buildCommentTree(postComments);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {post.author?.profilePicture ? (
          <img
            src={post.author?.profilePicture }
            alt={post.author?.username}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          ) :(<DefaultLogo  user={post.author}/>)}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {post.author?.username || "Unknown"}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
              {post.author?._id && (
             <FollowButton userId={post.author._id} />
           )}
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-gray-800 text-sm leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="w-full bg-gray-50">
          <img
            src={post.image}
            alt="post"
            className="w-full h-auto max-h-[500px] sm:max-h-[600px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            {post.likes?.length > 0 && (
              <span>
                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {postComments.length > 0 && (
              <span>{postComments.length} {postComments.length === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-2 sm:px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handleLikeToggle(post._id, isLiked)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all ${
              isLiked
                ? "text-[#FB432C] bg-red-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs sm:text-sm font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Comment</span>
          </button>

          <button
            onClick={() => handleShare(post)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 bg-[#FAF9F2]">
          {/* Comment Input */}
          <div className="flex gap-2 pt-3 sm:pt-4 mb-3 sm:mb-4">
            <img
              src={currentUser?.profilePicture || "/default-profile.png"}
              alt="You"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentInputs['main'] || ""}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, ['main']: e.target.value }))}
                placeholder="Write a comment..."
                className="flex-1 bg-[#F0EFE9] rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FB432C]/20"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={() => handleComment()}
                className="bg-[#FB432C] text-white rounded-full p-2 hover:bg-[#FB432C]/90 transition flex-shrink-0"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {commentTree.length > 0 ? (
              commentTree.map(comment => (
                <CommentItem key={comment._id} comment={comment} />
              ))
            ) : (
              <p className="text-center text-gray-500 text-xs sm:text-sm py-6">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;