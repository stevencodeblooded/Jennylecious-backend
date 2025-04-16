const express = require("express");
const {
  getFAQs,
  getFAQCategories,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} = require("../controllers/faqs");

const FAQ = require("../models/FAQ");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getFAQs);
router.get("/categories", getFAQCategories);

// Admin routes - these should be under /api/admin/faqs in server.js
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(FAQ), getAllFAQs).post(createFAQ);

router.route("/:id").put(updateFAQ).delete(deleteFAQ);

router.put("/reorder", reorderFAQs);

module.exports = router;
