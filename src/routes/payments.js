const express = require("express");
const {
  initiateMpesaPayment,
  mpesaCallback,
  verifyPayment,
} = require("../controllers/payments");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/mpesa/initiate", protect, initiateMpesaPayment);
router.post("/mpesa/callback", mpesaCallback);
router.get("/verify/:id", protect, verifyPayment);

module.exports = router;
