const express = require("express");
const router = express.Router();

router.use("/dashboard", require("./dashboard.routes"));
router.use("/categories", require("./category.routes"));
router.use("/coupons", require("./coupon.routes"));
router.use("/events", require("./event.routes"));
router.use("/orders", require("./order.routes"));
router.use("/products", require("./product.routes"));
router.use("/users", require("./user.routes"));
router.use("/chatbot", require("./chatbot.routes"));

module.exports = router;
