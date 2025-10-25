import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    organizer: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ["In-Person", "Online", "Hybrid"],
      required: true,
    },

    // Added Contact To Event (v2)
    // contact: [{ type: String,required: true }],
    
    tags: [{ type: String }],
    registrationLink: { type: String },
    image: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
          }
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],

author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
authorUsername: { type: String, required: true },
authorProfilePicture: { type: String, default: "" },

  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
// module.exports = mongoose.model("Event", eventSchema);
