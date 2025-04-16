const express = require("express");
const {
  getPublicSettings,
  getAllSettings,
  updateSettings,
} = require("../controllers/settings");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public route
router.get("/", getPublicSettings);

// Admin routes - these should be under /api/admin/settings in server.js
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getAllSettings).put(updateSettings);

module.exports = router;
