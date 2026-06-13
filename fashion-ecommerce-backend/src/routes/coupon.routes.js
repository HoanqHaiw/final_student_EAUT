const express = require("express");
const router = express.Router();

const couponController = require("../controllers/coupon.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/validate", authMiddleware, couponController.validate);

module.exports = router;