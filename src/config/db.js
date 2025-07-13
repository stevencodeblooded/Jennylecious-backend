const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // Check if we already have a cached connection
  if (cachedConnection) {
    console.log("Using cached database connection");
    return cachedConnection;
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI exists:", !!process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Important for serverless - prevent connection pooling issues
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error; // Don't exit process in serverless environment
  }
};

module.exports = connectDB;
