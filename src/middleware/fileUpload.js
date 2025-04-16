const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./async");

// Middleware to handle file uploads
const fileUpload = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const file = req.files.file;

  // Check if it's an image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `${req.filePrefix || "file"}_${Date.now()}${
    path.parse(file.name).ext
  }`;

  // Set file path
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/${req.uploadDir || ""}`;

  // Move file to upload location
  file.mv(`${uploadPath}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse("Problem with file upload", 500));
    }

    // Add file URL to request for controller to use
    req.fileUrl = `/uploads/${req.uploadDir ? req.uploadDir + "/" : ""}${
      file.name
    }`;
    next();
  });
});

module.exports = fileUpload;
