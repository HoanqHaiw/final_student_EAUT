const mongoose = require("mongoose");
const Coupon = require("../models/coupon.model");

const validateCoupon = async (code, totalPrice) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive) {
        throw new Error("Coupon not found");
    }

    // check expired
    if (coupon.expiredAt && coupon.expiredAt < new Date()) {
        throw new Error("Coupon expired");
    }

    // check usage
    if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) {
        throw new Error("Coupon usage limit reached");
    }

    // check min order
    if (totalPrice < coupon.minOrder) {
        throw new Error("Not enough order value");
    }

    // calculate discount
    let discount = 0;

    if (coupon.type === "percent") {
        discount = (totalPrice * coupon.value) / 100;
        if (coupon.maxDiscount && coupon.maxDiscount > 0) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else {
        discount = coupon.value;
    }

    return {
        coupon,
        discount
    };
};

const increaseUsage = async (couponId) => {
    await Coupon.findByIdAndUpdate(couponId, {
        $inc: { used: 1 }
    });
};

const decreaseUsage = async (couponIdentifier) => {
    const filter = mongoose.Types.ObjectId.isValid(couponIdentifier)
        ? { _id: couponIdentifier }
        : { code: couponIdentifier.toUpperCase() };

    await Coupon.findOneAndUpdate(filter, {
        $inc: { used: -1 },
        $max: { used: 0 }
    });
};

module.exports = {
    validateCoupon,
    increaseUsage,
    decreaseUsage
};