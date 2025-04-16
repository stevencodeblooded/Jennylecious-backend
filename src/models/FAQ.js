const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Please add a question"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Please add an answer"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FAQ", FAQSchema);
