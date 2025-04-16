const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Order = require("../models/Order");
const User = require("../models/User");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Add user ID to customer if logged in
  if (req.user) {
    req.body.customer.userId = req.user.id;
  }

  const order = await Order.create(req.body);

  // Add order to user's orders array if logged in
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { orders: order._id },
    });
  }

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Get current user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ "customer.userId": req.user.id }).sort({
    orderDate: -1,
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure order belongs to user or user is admin
  if (
    order.customer.userId.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse(`Not authorized to access this order`, 401));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// =================== ADMIN ROUTES ===================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Add notes to order
// @route   PUT /api/admin/orders/:id/notes
// @access  Private/Admin
exports.addOrderNotes = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { notes: req.body.notes },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update payment status
// @route   PUT /api/admin/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      paymentStatus: req.body.paymentStatus,
      paymentDetails: req.body.paymentDetails || order.paymentDetails,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Delete order
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Remove order from user's orders array if there's a user
  if (order.customer.userId) {
    await User.findByIdAndUpdate(order.customer.userId, {
      $pull: { orders: order._id },
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
