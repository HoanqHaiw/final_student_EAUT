const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/admin/order.controller");
const { authMiddleware, adminMiddleware, staffMiddleware } = require("../../middlewares/auth.middleware");

// admin endpoints
router.get("/", authMiddleware, staffMiddleware, ctrl.getOrdersAdmin);
router.get("/export", authMiddleware, adminMiddleware, ctrl.exportOrders);
router.get("/:id", authMiddleware, staffMiddleware, ctrl.getOrderDetail);
router.put("/:id/status", authMiddleware, staffMiddleware, ctrl.updateOrderStatus);
router.put("/:id/payment-status", authMiddleware, adminMiddleware, ctrl.updatePaymentStatus);
router.put("/:id/shipping", authMiddleware, staffMiddleware, ctrl.updateShippingInfo);
router.put("/:id/return", authMiddleware, staffMiddleware, ctrl.updateReturnStatus);

module.exports = router;