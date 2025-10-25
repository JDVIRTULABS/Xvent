import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "image required",
        success: false,
      });
    }

    //   image upload

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    // buffer to data uri

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: "new post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const likedUserId = req.id;
    const postId = req.params.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    // Check if user already liked the post using string comparison
    const isAlreadyLiked = post.likes.some(id => id.toString() === likedUserId.toString());
    
    if (isAlreadyLiked) {
      return res.status(400).json({ 
        message: "Post already liked", 
        success: false,
        likes: post.likes 
      });
    }

    // Add user to likes
    post.likes.push(likedUserId);
    await post.save();

    return res.status(200).json({ 
      message: "Post liked successfully", 
      success: true, 
      likes: post.likes 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const likedUserId = req.id;
    const postId = req.params.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    // Check if user has liked the post
    const isLiked = post.likes.some(id => id.toString() === likedUserId.toString());
    
    if (!isLiked) {
      return res.status(400).json({ 
        message: "Post not liked yet", 
        success: false,
        likes: post.likes 
      });
    }

    // Remove user from likes using string comparison
    post.likes = post.likes.filter((id) => id.toString() !== likedUserId.toString());
    await post.save();

    return res.status(200).json({ 
      message: "Post disliked successfully", 
      success: true, 
      likes: post.likes 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentedByUserId = req.id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ 
        message: "Comment text is required", 
        success: false 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        success: false 
      });
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: commentedByUserId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username profilePicture"
    );

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        success: false 
      });
    }

    // Check if the user is the author
    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({ 
        message: "Unauthorized: You can only delete your own posts", 
        success: false 
      });
    }

    // Delete post
    await Post.findByIdAndDelete(postId);

    // Remove the post from user's posts colltn
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId.toString());
    await user.save();

    // Delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        message: "Post not found", 
        success: false 
      });
    }
    
    const user = await User.findById(authorId);
    
    // Check if already boookmarked using string comparison
    const isBookmarked = user.bookmarks.some(id => id.toString() === postId.toString());
    
    if (isBookmarked) {
      // Remove from bookmark
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({
        message: "Removed from bookmark",
        type: "unsaved",
        success: true,
      });
    } else {
      // Add to bookmark
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({
        message: "Added to bookmark",
        type: "saved",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const { caption } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    // Ensure only author can edit
    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({ message: "Unauthorized author", success: false });
    }

    let updatedImageUrl = post.image; // keep old image by default

    // If new image uploaded, process it
    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      updatedImageUrl = cloudResponse.secure_url;
    }

    // Update post
    post.caption = caption || post.caption;
    post.image = updatedImageUrl;

    await post.save();

    await post.populate({ path: "author", select: "username profilePicture" });

    return res.status(200).json({
      message: "Post updated successfully",
      post,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


export const getLikesOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.id; // logged in user (to check if they liked or not)

    const post = await Post.findById(postId).populate(
      "likes", // populate user info for likes
      "username profilePicture"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    // Check if current user liked the post
    const isLikedByCurrentUser = post.likes.some(
      (user) => user._id.toString() === currentUserId.toString()
    );

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      isLikedByCurrentUser,
      likedUsers: post.likes, // array of users who liked
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
