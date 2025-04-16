const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      ref: "Category",
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    image: {
      type: String,
      required: [true, "Please add an image URL"],
    },
    allergens: {
      type: [String],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        name: String,
        choices: [String],
      },
    ],
    minServings: {
      type: Number,
    },
    maxServings: {
      type: Number,
    },
    minQuantity: {
      type: Number,
      default: 1,
    },
    maxQuantity: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Product", ProductSchema);
