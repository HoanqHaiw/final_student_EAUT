const Review = require("../models/review.model");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

// CREATE a review
const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        const userId = req.user._id;

        // Check if the user has a delivered order containing this product
        const hasBought = await Order.findOne({
            user: userId,
            status: "delivered",
            "items.product": productId
        });

        if (!hasBought) {
            return res.status(403).json({
                success: false,
                message: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công."
            });
        }

        // Check if the user already reviewed this product
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã đánh giá sản phẩm này rồi."
            });
        }

        const review = new Review({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn!",
            data: review
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reviews = await Review.find({ product: productId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    createReview,
    getProductReviews
};
