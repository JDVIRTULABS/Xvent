import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addNewEvent,
  getAllEvents,
  getUserEvents,
  likeEvent,
  dislikeEvent,
  addCommentToEvent,
  getCommentsOfEvent,
  deleteEvent,
  bookmarkEvent,
  getEventById,
  getRecommendedEvents,
  updateEvent,
  addReplyToComment,
  getAllEventsForPublic,
  // addReplyToComment,
} from "../controllers/event.controller.js";

const router = express.Router();


router.route("/add").post(isAuthenticated, upload.single("image"), addNewEvent);
router.route("/all").get(isAuthenticated, getAllEvents);
router.route("/public").get( getAllEventsForPublic);
router.route("/userevent/all").get(isAuthenticated, getUserEvents);

router.route("/:id/update").put(isAuthenticated, upload.single("image"), updateEvent);

// Recommended events (specific route MUST come before dynamic :id route)
router.get("/recommended", isAuthenticated, getRecommendedEvents);

router.route("/:id/like").post(isAuthenticated, likeEvent);
router.route("/:id/dislike").post(isAuthenticated, dislikeEvent);
router.route("/:id/comment").post(isAuthenticated, addCommentToEvent);
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfEvent);
router.route("/:id/delete").delete(isAuthenticated, deleteEvent);
router.route("/:id/bookmark").post(isAuthenticated, bookmarkEvent);
router.route("/:id").get(isAuthenticated, getEventById)

router.post("/:id/comment/:commentId/reply", isAuthenticated, addReplyToComment);

// router.post("/:eventId/comment/:commentId/reply", isAuthenticated, addReplyToComment);

export default router;
