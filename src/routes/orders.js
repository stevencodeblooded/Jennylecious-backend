const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  addOrderNotes,
  updatePaymentStatus,
  deleteOrder,
} = require("../controllers/orders");

const Order = require("../models/Order");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Regular user routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

// Admin routes - these should be under /api/admin/orders in server.js
router.use(protect);
router.use(authorize("admin"));

router.get("/", advancedResults(Order, { path: "customer.userId" }), getOrders);

router.route("/:id").delete(deleteOrder);

router.route("/:id/status").put(updateOrderStatus);

router.route("/:id/notes").put(addOrderNotes);

router.route("/:id/payment").put(updatePaymentStatus);

module.exports = router;
