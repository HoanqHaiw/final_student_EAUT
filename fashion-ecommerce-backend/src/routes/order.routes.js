const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/user/order.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, ctrl.createOrder);
router.get("/my", authMiddleware, ctrl.getMyOrders);
router.get("/:id", authMiddleware, ctrl.getOrderById);
router.put("/:id/cancel", authMiddleware, ctrl.cancelOrder);

module.exports = router;