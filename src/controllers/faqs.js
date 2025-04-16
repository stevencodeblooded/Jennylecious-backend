const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const FAQ = require("../models/FAQ");

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getFAQs = asyncHandler(async (req, res, next) => {
  const faqs = await FAQ.find().sort({ order: 1 });

  res.status(200).json({
    success: true,
    count: faqs.length,
    data: faqs,
  });
});

// @desc    Get FAQ categories
// @route   GET /api/faqs/categories
// @access  Public
exports.getFAQCategories = asyncHandler(async (req, res, next) => {
  const categories = await FAQ.distinct("category");

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// =================== ADMIN ROUTES ===================

// @desc    Get all FAQs with management details
// @route   GET /api/admin/faqs
// @access  Private/Admin
exports.getAllFAQs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Create new FAQ
// @route   POST /api/admin/faqs
// @access  Private/Admin
exports.createFAQ = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.create(req.body);

  res.status(201).json({
    success: true,
    data: faq,
  });
});

// @desc    Update FAQ
// @route   PUT /api/admin/faqs/:id
// @access  Private/Admin
exports.updateFAQ = asyncHandler(async (req, res, next) => {
  let faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(
      new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
    );
  }

  faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: faq,
  });
});

// @desc    Delete FAQ
// @route   DELETE /api/admin/faqs/:id
// @access  Private/Admin
exports.deleteFAQ = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(
      new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
    );
  }

  await faq.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Reorder FAQs
// @route   PUT /api/admin/faqs/reorder
// @access  Private/Admin
exports.reorderFAQs = asyncHandler(async (req, res, next) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders)) {
    return next(
      new ErrorResponse("Please provide an array of FAQ ids and orders", 400)
    );
  }

  // Update each FAQ with its new order
  const updatePromises = orders.map((item) => {
    return FAQ.findByIdAndUpdate(item.id, { order: item.order });
  });

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: "FAQs reordered successfully",
  });
});
