const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Settings = require("../models/Settings");

// @desc    Get public settings
// @route   GET /api/settings
// @access  Public
exports.getPublicSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();

  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }

  // Return only public settings (exclude payment info)
  const publicSettings = {
    storeName: settings.storeName,
    contactEmail: settings.contactEmail,
    phone: settings.phone,
    address: settings.address,
    businessHours: settings.businessHours,
    socialLinks: settings.socialLinks,
  };

  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});

// @desc    Get all settings (including sensitive info)
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getAllSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();

  // If no settings exist, create default settings
  if (!settings) {
    settings = await Settings.create({});
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();

  if (!settings) {
    // Create settings if they don't exist
    settings = await Settings.create(req.body);
  } else {
    // Update existing settings
    settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});
