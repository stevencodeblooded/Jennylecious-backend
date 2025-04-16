const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Please add a category ID"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Please add a category name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", CategorySchema);
