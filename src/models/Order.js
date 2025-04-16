const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Please add an order number"],
      unique: true,
      trim: true,
    },
    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        required: [true, "Please add a customer name"],
      },
      email: {
        type: String,
        required: [true, "Please add a customer email"],
      },
      phone: {
        type: String,
        required: [true, "Please add a customer phone"],
      },
      address: {
        type: String,
      },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        customizations: {
          type: Object,
        },
      },
    ],
    total: {
      type: Number,
      required: [true, "Please add a total"],
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentDetails: {
      type: Object,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: [true, "Please add a delivery date"],
    },
    deliveryAddress: {
      type: String,
    },
    deliveryInstructions: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
OrderSchema.pre("save", function (next) {
  if (this.isNew) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    this.orderNumber = `JCB-${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
