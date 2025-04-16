const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductsByCategory,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/products");

const Product = require("../models/Product");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", advancedResults(Product), getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProduct);

// Admin routes - these should be under /api/admin/products in server.js
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createProduct);

router.route("/:id").put(updateProduct).delete(deleteProduct);

router.post("/upload", uploadProductImage);

router.route("/categories").post(createCategory);

router.route("/categories/:id").put(updateCategory).delete(deleteCategory);

module.exports = router;
