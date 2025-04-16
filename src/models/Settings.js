const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Jennylecious Cakes & Bakes",
    },
    contactEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    businessHours: {
      type: Object,
      default: {
        monday: "9:00 AM - 5:00 PM",
        tuesday: "9:00 AM - 5:00 PM",
        wednesday: "9:00 AM - 5:00 PM",
        thursday: "9:00 AM - 5:00 PM",
        friday: "9:00 AM - 5:00 PM",
        saturday: "10:00 AM - 3:00 PM",
        sunday: "Closed",
      },
    },
    socialLinks: {
      type: Object,
      default: {
        facebook: "",
        instagram: "",
        twitter: "",
      },
    },
    payment: {
      mpesaConsumerKey: {
        type: String,
      },
      mpesaConsumerSecret: {
        type: String,
      },
      mpesaPasskey: {
        type: String,
      },
      businessShortCode: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Make sure there's only one settings document
SettingsSchema.pre("save", async function (next) {
  const count = await this.constructor.countDocuments();
  if (count > 0 && this.isNew) {
    const error = new Error("Only one settings document is allowed");
    return next(error);
  }
  next();
});

module.exports = mongoose.model("Settings", SettingsSchema);
