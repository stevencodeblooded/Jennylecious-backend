const axios = require("axios");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Order = require("../models/Order");
const Settings = require("../models/Settings");

// Helper function to get M-Pesa credentials from settings
const getMpesaCredentials = async () => {
  const settings = await Settings.findOne();

  if (!settings || !settings.payment) {
    throw new ErrorResponse("M-Pesa payment settings not configured", 500);
  }

  return {
    consumerKey:
      settings.payment.mpesaConsumerKey || process.env.MPESA_CONSUMER_KEY,
    consumerSecret:
      settings.payment.mpesaConsumerSecret || process.env.MPESA_CONSUMER_SECRET,
    passkey: settings.payment.mpesaPasskey || process.env.MPESA_PASSKEY,
    shortcode:
      settings.payment.businessShortCode || process.env.MPESA_SHORTCODE,
  };
};

// Helper function to get M-Pesa auth token
const getMpesaAuthToken = async () => {
  try {
    const { consumerKey, consumerSecret } = await getMpesaCredentials();

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64"
    );

    const response = await axios({
      method: "get",
      url: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting M-Pesa auth token:", error);
    throw new ErrorResponse("Failed to authenticate with M-Pesa", 500);
  }
};

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/payments/mpesa/initiate
// @access  Private
exports.initiateMpesaPayment = asyncHandler(async (req, res, next) => {
  const { phone, amount, orderId } = req.body;

  if (!phone || !amount || !orderId) {
    return next(
      new ErrorResponse("Please provide phone, amount and orderId", 400)
    );
  }

  // Find the order
  const order = await Order.findById(orderId);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${orderId}`, 404)
    );
  }

  // Get M-Pesa credentials
  const { shortcode, passkey } = await getMpesaCredentials();

  // Get auth token
  const token = await getMpesaAuthToken();

  // Format phone number (remove leading 0 and add country code)
  let formattedPhone = phone;
  if (phone.startsWith("0")) {
    formattedPhone = "254" + phone.substring(1);
  }

  // Format date time
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  // Create password
  const password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  try {
    const response = await axios({
      method: "post",
      url: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${req.protocol}://${req.get(
          "host"
        )}/api/payments/mpesa/callback`,
        AccountReference: `Order ${order.orderNumber}`,
        TransactionDesc: "Payment for Jennylecious Cakes",
      },
    });

    // Update order with payment initiation details
    await Order.findByIdAndUpdate(orderId, {
      paymentMethod: "mpesa",
      paymentDetails: {
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        initiatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(
      "M-Pesa initiation error:",
      error.response?.data || error.message
    );
    return next(new ErrorResponse("Failed to initiate M-Pesa payment", 500));
  }
});

// @desc    M-Pesa callback
// @route   POST /api/payments/mpesa/callback
// @access  Public
exports.mpesaCallback = asyncHandler(async (req, res, next) => {
  try {
    const { Body } = req.body;

    // Log the callback for debugging
    console.log("M-Pesa Callback:", JSON.stringify(req.body));

    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestID = Body.stkCallback.CheckoutRequestID;

      // Find order with this checkout request ID
      const order = await Order.findOne({
        "paymentDetails.checkoutRequestID": checkoutRequestID,
      });

      if (!order) {
        console.error(
          "Order not found for checkout request ID:",
          checkoutRequestID
        );
        return res.status(200).json({ success: true });
      }

      // Update order payment status
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "Completed",
        "paymentDetails.transactionDetails":
          Body.stkCallback.CallbackMetadata.Item,
        "paymentDetails.completedAt": new Date(),
      });
    } else {
      // Payment failed
      const checkoutRequestID = Body.stkCallback.CheckoutRequestID;

      const order = await Order.findOne({
        "paymentDetails.checkoutRequestID": checkoutRequestID,
      });

      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: "Failed",
          "paymentDetails.failureReason": Body.stkCallback.ResultDesc,
          "paymentDetails.failedAt": new Date(),
        });
      }
    }

    // Always respond with success to Safaricom
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    res.status(200).json({ success: true });
  }
});

// @desc    Verify payment for order
// @route   GET /api/payments/verify/:id
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user has permission to check this order
  if (
    req.user.role !== "admin" &&
    order.customer.userId.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse("Not authorized to verify this payment", 401)
    );
  }

  // For M-Pesa, we can check the stored payment status
  if (order.paymentMethod === "mpesa") {
    return res.status(200).json({
      success: true,
      data: {
        verified: order.paymentStatus === "Completed",
        status: order.paymentStatus,
        details: order.paymentDetails,
      },
    });
  }

  // For other payment methods
  res.status(200).json({
    success: true,
    data: {
      verified: order.paymentStatus === "Completed",
      status: order.paymentStatus,
    },
  });
});
