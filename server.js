const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/error");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const productRoutes = require("./src/routes/products");
const orderRoutes = require("./src/routes/orders");
const paymentRoutes = require("./src/routes/payments");
const settingsRoutes = require("./src/routes/settings");
const faqRoutes = require("./src/routes/faqs");
const testimonialRoutes = require("./src/routes/testimonials");

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],  // Include both localhost variations
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// File uploading
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);

// Set static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Set static folder
app.use("/uploads", express.static("src/uploads"));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);

app.use("/api/admin/users", userRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/faqs", faqRoutes);
app.use("/api/admin/testimonials", testimonialRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
