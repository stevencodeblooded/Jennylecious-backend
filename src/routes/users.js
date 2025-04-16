const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserNotes,
} = require("../controllers/users");

const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Regular user routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, updatePassword);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:id", protect, removeFromWishlist);

// Admin routes
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/:id/notes").put(updateUserNotes);

module.exports = router;
