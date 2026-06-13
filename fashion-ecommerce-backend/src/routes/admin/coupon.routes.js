const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");
const { validateCoupon } = require("../../middlewares/validation.middleware");
const couponAdminController = require("../../controllers/admin/coupon.controller");

/**
 * ADMIN ONLY ROUTES
 * All routes require: authMiddleware + adminMiddleware
 */

// GET all coupons
router.get("/", authMiddleware, adminMiddleware, couponAdminController.getAllCoupons);

// GET coupon by id
router.get("/:id", authMiddleware, adminMiddleware, couponAdminController.getCouponById);

// CREATE coupon
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validateCoupon,
    couponAdminController.createCoupon
);

// UPDATE coupon
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateCoupon,
    couponAdminController.updateCoupon
);

// DELETE coupon
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    couponAdminController.deleteCoupon
);

module.exports = router;
