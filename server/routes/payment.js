const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");

// Create payment
router.post("/create", async (req, res) => {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      customerPhone,
      address
    } = req.body;

    const transactionId = "CAMPUSBITE_" + Date.now();

    const paymentData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,

      total_amount: amount,
      currency: "BDT",
      tran_id: transactionId,

      success_url:
        "https://campus-bite-backend-chnqx8281-mrl-world.vercel.app/api/payment/success",

      fail_url:
        "https://campus-bite-backend-chnqx8281-mrl-world.vercel.app/api/payment/fail",

      cancel_url:
        "https://campus-bite-backend-chnqx8281-mrl-world.vercel.app/api/payment/cancel",

      // Customer information
      cus_name: customerName,
      cus_email: customerEmail,
      cus_add1: address || "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1212",
      cus_country: "Bangladesh",
      cus_phone: customerPhone,

      // Shipping information
      shipping_method: "YES",
      num_of_item: 1,

      ship_name: customerName,
      ship_add1: address || "Dhaka",
      ship_city: "Dhaka",
      ship_postcode: "1212",
      ship_country: "Bangladesh",

      // Product information
      product_name: "Campus Bite Food Order",
      product_category: "Food",
      product_profile: "general"
    };

    const response = await axios.post(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      qs.stringify(paymentData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error(
      "Payment Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Payment create করা যায়নি"
    });
  }
});

// Payment success callback
router.all("/success", (req, res) => {
  console.log("Payment Success:", req.body);

  res.redirect(
    "https://campus-bite-frontend.vercel.app/payment-success"
  );
});

// Payment fail callback
router.all("/fail", (req, res) => {
  console.log("Payment Failed:", req.body);

  res.redirect(
    "https://campus-bite-frontend.vercel.app/payment-failed"
  );
});

// Payment cancel callback
router.all("/cancel", (req, res) => {
  console.log("Payment Cancelled:", req.body);

  res.redirect(
    "https://campus-bite-frontend.vercel.app/checkout"
  );
});

module.exports = router;