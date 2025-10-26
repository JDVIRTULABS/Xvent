import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { Event } from "../models/event.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id username email profilePicture");
    // Only sending safe fields, no password
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//  Adding AUTU(google auth)

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ✅ Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3–20 characters",
        success: false,
      });
    }

    const strongPasswordRegex =
      /^(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must include at least one letter, one number, one special character, and be 8+ characters long",
        success: false,
      });
    }

    // ✅ Check for existing users
    if (await User.findOne({ username: cleanUsername })) {
      return res.status(409).json({
        message: "Username already taken",
        success: false,
      });
    }
    if (await User.findOne({ email })) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // ✅ Create user
    const newUser = await User.create({
      username: cleanUsername,
      email,
      password: hashedPassword,
      verified: false,
      verificationToken,
      verificationTokenExpires: tokenExpiry,
    });

    // ✅ Prepare email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // ✅ Send email asynchronously (non-blocking)
    transporter
      .sendMail({
        from: `"Xvent Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your account",
        text: `Welcome, ${cleanUsername}! Verify your email: ${verificationLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Welcome, ${cleanUsername}!</h2>
            <p style="color: #555; font-size: 16px;">
              Thanks for signing up. Please verify your email to activate your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                style="background-color: #007bff; color: #fff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">
              If you did not create an account, ignore this email.
            </p>
          </div>
        `,
      })
      .then(() => console.log(`Verification email sent to ${email}`))
      .catch((err) => console.error("Email sending failed:", err));

    // ✅ Respond immediately to frontend
    return res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      success: true,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    if (user.verified) {
      return res.status(200).json({
        message: "Email already verified",
        success: true,
      });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Token expired",
        success: false,
        email: user.email, // send email so frontend can resend
      });
    }

    // Mark user as verified
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user.verified) {
      return res
        .status(200)
        .json({ message: "Email already verified", success: true });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpiry;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or other email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your account",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello, ${user.username}!</h2>
        <p style="color: #555; font-size: 16px;">
          You requested a new verification email. Click below to verify your account:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
            style="background-color: #007bff; color: #fff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          This link will expire in 1 hour. If you did not request this, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © 2025 YourAppName. All rights reserved.
        </p>
      </div>
      `,
    });

    return res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
      success: true,
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

//  Done auth

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    // If user signed up via Google, they may not have a password
    if (!user.password) {
      return res.status(401).json({
        message: "Please login with Google",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Populate posts and events (only existing)
    const posts = await Post.find({
      _id: { $in: user.posts },
      author: user._id,
    });
    const events = await Event.find({
      _id: { $in: user.events },
      author: user._id,
    });

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts,
      events,
    };

    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProd, // HTTPS only in prod
        sameSite: isProd ? "None" : "Lax",
        domain: isProd ? ".xvent.in" :undefined, // important for prod subdomains
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: userData,
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// REMOVE TOKEN (pending)

export const logout = async (_, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      domain: isProd ? ".xvent.in" : undefined,
      maxAge: 0,
    });
  } catch (error) {
    console.log(error);
  }
};

// Search USER using INDEXING not Ref

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // find user without password
    let user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // populate posts
    const posts = await Post.find({ author: userId });
    // populate events
    const events = await Event.find({ author: userId });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        gender: user.gender,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        posts,
        events,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Populate posts
    const posts = await Post.find({ author: req.id });
    const events = await Event.find({ author: req.id });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        gender: user.gender,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        verified: user.verified,
        posts,
        events,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not Found",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

// Mutual following (V2)

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently no suggestion for you",
        // success: false
      });
    }
    return res.status(200).json({
      users: suggestedUsers,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Dont add follow Btn

export const followorUnfollow = async (req, res) => {
  try {
    const whoseFollowing = req.id;
    const imFollowing = req.params.id;
    if (whoseFollowing === imFollowing) {
      return res.status(400).json({
        message: "You can't follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(whoseFollowing);
    const targetUser = await User.findById(imFollowing);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "user not found",
        success: false,
      });
    }

    // checking whether should i follow or not

    const isFollowing = user.following.includes(imFollowing);
    if (isFollowing) {
      //unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: whoseFollowing },
          { $pull: { following: imFollowing } }
        ),
        User.updateOne(
          { _id: imFollowing },
          { $pull: { followers: whoseFollowing } }
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed Successfully",
        success: true,
      });
    } else {
      // follow logic
      await Promise.all([
        User.updateOne(
          { _id: whoseFollowing },
          { $push: { following: imFollowing } }
        ),
        User.updateOne(
          { _id: imFollowing },
          { $push: { followers: whoseFollowing } }
        ),
      ]);
      return res.status(200).json({
        message: "following Successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
export const bookmarks = async (req, res) => {
  try {
    const userId = req.id;
    const eventId = req.params.postId; // better rename to eventId for clarity

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // Toggle bookmark
    const isBookmarked = user.bookmarks.includes(eventId);
    if (isBookmarked) {
      user.bookmarks.pull(eventId);
      await user.save();
      return res.json({ success: true, message: "Bookmark removed" });
    } else {
      user.bookmarks.push(eventId);
      await user.save();
      return res.json({ success: true, message: "Bookmarked successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.id).populate("bookmarks");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("following");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, following: user.following });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
