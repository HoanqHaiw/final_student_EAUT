const couponService = require("../../services/coupon.service");
const Coupon = require("../../models/coupon.model");

/**
 * ADMIN COUPON MANAGEMENT ENDPOINTS
 */

// GET all coupons
const getAllCoupons = async (req, res) => {
    try {
        const { keyword, isActive } = req.query;

        let filter = {};

        if (keyword) {
            filter.code = { $regex: keyword, $options: "i" };
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET coupon by id
const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        res.json({
            success: true,
            data: coupon
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// CREATE coupon
const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrder, maxDiscount, expiredAt, usageLimit, isActive } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        const newCoupon = await Coupon.create({
            code: code.toUpperCase(),
            type,
            value,
            minOrder: minOrder || 0,
            maxDiscount: maxDiscount || 0,
            expiredAt,
            usageLimit: usageLimit || 0,
            isActive: isActive !== false
        });

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: newCoupon
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// UPDATE coupon
const updateCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrder, maxDiscount, expiredAt, usageLimit, isActive } = req.body;

        // Check if new code already exists (if code is being changed)
        if (code) {
            const existingCoupon = await Coupon.findOne({
                code: code.toUpperCase(),
                _id: { $ne: req.params.id }
            });
            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code already exists"
                });
            }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                ...(code && { code: code.toUpperCase() }),
                ...(type && { type }),
                ...(value !== undefined && { value }),
                ...(minOrder !== undefined && { minOrder }),
                ...(maxDiscount !== undefined && { maxDiscount }),
                ...(expiredAt && { expiredAt }),
                ...(usageLimit !== undefined && { usageLimit }),
                ...(isActive !== undefined && { isActive })
            },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        res.json({
            success: true,
            message: "Coupon updated successfully",
            data: updatedCoupon
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// DELETE coupon
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        res.json({
            success: true,
            message: "Coupon deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
