const express = require("express");
const {
  getApprovedTestimonials,
  submitTestimonial,
  getAllTestimonials,
  approveTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialImage,
} = require("../controllers/testimonials");

const Testimonial = require("../models/Testimonial");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getApprovedTestimonials);
router.post("/", submitTestimonial);

// Admin routes - these should be under /api/admin/testimonials in server.js
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(Testimonial), getAllTestimonials);

router.route("/:id").put(updateTestimonial).delete(deleteTestimonial);

router.route("/:id/approve").put(approveTestimonial);

router.post("/upload", uploadTestimonialImage);

module.exports = router;
