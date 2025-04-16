const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Testimonial = require("../models/Testimonial");

// @desc    Get approved testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getApprovedTestimonials = asyncHandler(async (req, res, next) => {
  const testimonials = await Testimonial.find({ approved: true }).sort({
    date: -1,
  });

  res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials,
  });
});

// @desc    Submit a testimonial
// @route   POST /api/testimonials
// @access  Public
exports.submitTestimonial = asyncHandler(async (req, res, next) => {
  // Set approved to false by default for new submissions
  req.body.approved = false;

  const testimonial = await Testimonial.create(req.body);

  res.status(201).json({
    success: true,
    data: testimonial,
  });
});

// =================== ADMIN ROUTES ===================

// @desc    Get all testimonials (including unapproved)
// @route   GET /api/admin/testimonials
// @access  Private/Admin
exports.getAllTestimonials = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Approve testimonial
// @route   PUT /api/admin/testimonials/:id/approve
// @access  Private/Admin
exports.approveTestimonial = asyncHandler(async (req, res, next) => {
  let testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(
      new ErrorResponse(
        `Testimonial not found with id of ${req.params.id}`,
        404
      )
    );
  }

  testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { approved: req.body.approved },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: testimonial,
  });
});

// @desc    Update testimonial
// @route   PUT /api/admin/testimonials/:id
// @access  Private/Admin
exports.updateTestimonial = asyncHandler(async (req, res, next) => {
  let testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(
      new ErrorResponse(
        `Testimonial not found with id of ${req.params.id}`,
        404
      )
    );
  }

  testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: testimonial,
  });
});

// @desc    Delete testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(
      new ErrorResponse(
        `Testimonial not found with id of ${req.params.id}`,
        404
      )
    );
  }

  await testimonial.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload testimonial image
// @route   POST /api/admin/testimonials/upload
// @access  Private/Admin
exports.uploadTestimonialImage = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `testimonial_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/testimonials/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      const imageUrl = `/uploads/testimonials/${file.name}`;

      res.status(200).json({
        success: true,
        data: imageUrl,
      });
    }
  );
});
