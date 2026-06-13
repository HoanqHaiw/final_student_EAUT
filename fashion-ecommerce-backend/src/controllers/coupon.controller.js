const couponService = require("../services/coupon.service");

// validate coupon
const validate = async (req, res) => {
    try {
        const { code, totalPrice } = req.body;

        const result = await couponService.validateCoupon(code, totalPrice);

        res.json({
            discount: result.discount,
            message: "Coupon valid"
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    validate
};