import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  getAllPost,
  getCommentsOfPost,
  getLikesOfPost,
  getSinglePost,
  getUserPost,
  likePost,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router
  .route("/add")
  .post(isAuthenticated, upload.single("image"), addNewPost);
router.route("/all").get(isAuthenticated, getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").put(isAuthenticated, likePost);
router.route("/:id/dislike").put(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment);
router.route("/:id/comment/all").post(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").post(isAuthenticated, bookmarkPost);
router
  .route("/update/:id")
  .put(isAuthenticated, upload.single("image"), updatePost);
router.get("/:id", isAuthenticated, getSinglePost);

router.get("/:id/likes", isAuthenticated, getLikesOfPost);

export default router;
