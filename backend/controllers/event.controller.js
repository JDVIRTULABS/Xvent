import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import streamifier from "streamifier";

// Create a new event
export const addNewEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      venue,
      organizer,
      category,
      type,
      tags,
      registrationLink,
    } = req.body;

    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "Event banner image is required",
        success: false,
      });
    }

    // ✅ Find the user (author)
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // ✅ Optimize and upload event image
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 1200, height: 800, fit: "cover" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    // ✅ Create event
    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      organizer,
      category,
      type,
      tags,
      registrationLink,
      image: cloudResponse.secure_url,
      author: user._id,
      authorUsername: user.username,
      authorProfilePicture: user.profilePicture || "", // <-- added fallback
    });

    // ✅ Add event to user's profile
    user.events.push(event._id);
    await user.save();

    // ✅ Populate author info before sending response
    await event.populate({
      path: "author",
      select: "username profilePicture",
    });

    res.status(201).json({
      message: "New event created successfully",
      event,
      success: true,
    });
  } catch (error) {
    console.error("Add New Event Error:", error);
    res.status(500).json({
      message: "Server error while creating event",
      error: error.message,
      success: false,
    });
  }
};


// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const userId = req.id; // logged-in user
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({ path: "comments.user", select: "username profilePicture" })
.populate({ path: "comments.replies.user", select: "username profilePicture" });

    // Fetch user bookmarks
    const user = await User.findById(userId);
    const bookmarks = user ? user.bookmarks.map(id => id.toString()) : [];

    return res.status(200).json({ success: true, events, bookmarks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Get events by logged-in user
export const getUserEvents = async (req, res) => {
  try {
    const authorId = req.id;
    const events = await Event.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" });

    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Like an event
export const likeEvent = async (req, res) => {
  try {
    const userId = req.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ message: "Event not found", success: false });

    await event.updateOne({ $addToSet: { likes: userId } });

    return res.status(200).json({ message: "Event Liked", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Dislike an event
export const dislikeEvent = async (req, res) => {
  try {
    const userId = req.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ message: "Event not found", success: false });

    await event.updateOne({ $pull: { likes: userId } });

    return res.status(200).json({ message: "Event Disliked", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const authorId = req.id;

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ message: "Event not found", success: false });

    if (event.author.toString() !== authorId)
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this event" });

    await Event.findByIdAndDelete(eventId);

    const user = await User.findById(authorId);
    if (user) {
      user.events = user.events.filter((id) => id.toString() !== eventId);
      await user.save();
    }

    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// Add Comment to Event
export const addCommentToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const commentedByUserId = req.id;
    const { text } = req.body;

    if (!text)
      return res.status(400).json({ message: "Text is required", success: false });

    const newComment = { user: commentedByUserId, text, createdAt: new Date() };

    // Push comment without validating whole document
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $push: { comments: newComment } },
      { new: true } // returns updated document
    ).populate("comments.user", "username profilePicture");

    if (!event)
      return res.status(404).json({ message: "Event not found", success: false });

    return res.status(201).json({
      message: "Comment Added",
      comment: event.comments[event.comments.length - 1],
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};



// Get All Comments of an Event
export const getCommentsOfEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId).populate(
      "comments.user",
      "username profilePicture"
    );

    if (!event)
      return res.status(404).json({ message: "Event not found", success: false });

    return res.status(200).json({ success: true, comments: event.comments });
  } catch (error) {
    console.log(error);
  }
};

// Bookmark Event
export const bookmarkEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found", success: false });

    const alreadyBookmarked = user.bookmarks.includes(eventId);

    if (alreadyBookmarked) {
      await user.updateOne({ $pull: { bookmarks: eventId } });
      return res.status(200).json({
        message: "Removed from bookmark",
        type: "unsaved",
        success: true,
      });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: eventId } });
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

export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("bookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user interactions
    const [liked, commented, bookmarked] = await Promise.all([
      Event.find({ likes: userId }).select("tags category"),
      Event.find({ "comments.user": userId }).select("tags category"),
      Event.find({ _id: { $in: user.bookmarks || [] } }).select("tags category"),
    ]);

    const totalInteractions = liked.length + commented.length + bookmarked.length;

    // If user has less than 4 interactions, show all upcoming events (no filtering)
    if (totalInteractions < 4) {
      const allEvents = await Event.find({ date: { $gte: new Date() } })
        .populate("author", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .populate("comments.replies.user", "username profilePicture")
        .sort({ createdAt: -1 })
        .limit(50);

      return res.status(200).json({
        success: true,
        events: allEvents,
        bookmarks: (user.bookmarks || []).map(id => id.toString()),
        interests: [], // not enough data yet
      });
    }

    // Build interest map
    const interestMap = {};
    [...liked, ...commented, ...bookmarked].forEach(ev => {
      ev.tags?.forEach(tag => {
        const key = tag.toLowerCase().trim();
        if (key) interestMap[key] = (interestMap[key] || 0) + 1;
      });
      if (ev?.category) {
        const cat = ev.category.toLowerCase().trim();
        if (cat) interestMap[cat] = (interestMap[cat] || 0) + 1;
      }
    });

    const topInterests = Object.keys(interestMap)
      .sort((a, b) => interestMap[b] - interestMap[a])
      .slice(0, 5);

    // Get recommended events based on interests
    let recommendedEvents = [];
    if (topInterests.length) {
      const regexes = topInterests.map(t => new RegExp(t, "i"));
      recommendedEvents = await Event.find({
        $or: [
          { tags: { $in: regexes } },
          { category: { $in: regexes } },
          { title: { $in: regexes } },
          { description: { $in: regexes } },
        ],
        date: { $gte: new Date() },
      })
        .populate("author", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .sort({ date: 1, createdAt: -1 })
        .limit(50);
    }

    // Fallback popular events if less than 10 recommended
    if (recommendedEvents.length < 10) {
      const popular = await Event.find({
        _id: { $nin: recommendedEvents.map(e => e._id) },
        date: { $gte: new Date() },
      })
        .populate("author", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .sort({ likes: -1, createdAt: -1 })
        .limit(10 - recommendedEvents.length);

      recommendedEvents = [...recommendedEvents, ...popular];
    }

    return res.status(200).json({
      success: true,
      events: recommendedEvents,
      bookmarks: (user.bookmarks || []).map(id => id.toString()),
      interests: topInterests,
    });

  } catch (error) {
    console.error("Get Recommended Events Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = { ...req.body };

    // Handle image upload if provided
 if (req.file) {
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "events" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });

  updateData.image = result.secure_url;
}
    // Convert tags from comma-separated string to array
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map(tag => tag.trim());
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });

    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event updated", event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update event" });
  }
};


export const addReplyToComment = async (req, res) => {
  try {
    const { id: eventId, commentId } = req.params;
    const userId = req.id;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Reply text is required", success: false });

    // Push reply directly to the comment using MongoDB positional operator
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, "comments._id": commentId },
      { $push: { "comments.$.replies": { user: userId, text, createdAt: new Date() } } },
      { new: true }
    ).populate("comments.replies.user", "username profilePicture");

    if (!updatedEvent)
      return res.status(404).json({ message: "Event or Comment not found", success: false });

    const comment = updatedEvent.comments.id(commentId);
    const addedReply = comment.replies[comment.replies.length - 1];

    return res.status(201).json({
      message: "Reply added successfully",
      reply: addedReply,
      success: true
    });

  } catch (error) {
    console.error("Add Reply Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get All Replies of a Comment
export const getRepliesOfComment = async (req, res) => {
  try {
    const { id: eventId, commentId } = req.params;

    const event = await Event.findById(eventId)
      .populate('comments.replies.user', 'username profilePicture');

    if (!event) {
      return res.status(404).json({ 
        message: "Event not found", 
        success: false 
      });
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ 
        message: "Comment not found", 
        success: false 
      });
    }

    return res.status(200).json({ 
      success: true, 
      replies: comment.replies || [] 
    });

  } catch (error) {
    console.error("Get Replies Error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};

// Delete Reply from Comment
export const deleteReply = async (req, res) => {
  try {
    const { id: eventId, commentId, replyId } = req.params;
    const userId = req.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        message: "Event not found", 
        success: false 
      });
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ 
        message: "Comment not found", 
        success: false 
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ 
        message: "Reply not found", 
        success: false 
      });
    }

    // Check if user is the author of the reply
    if (reply.user.toString() !== userId) {
      return res.status(403).json({ 
        message: "Unauthorized to delete this reply", 
        success: false 
      });
    }

    // Remove the reply
    reply.deleteOne();
    await event.save();

    return res.status(200).json({ 
      message: "Reply deleted successfully", 
      success: true 
    });

  } catch (error) {
    console.error("Delete Reply Error:", error);
    return res.status(500).json({ 
      message: "Server error", 
      success: false 
    });
  }
};