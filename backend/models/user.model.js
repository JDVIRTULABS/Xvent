import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
},

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

    // Email verification fields
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },

    // new field for recommendation logic
      interests: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
