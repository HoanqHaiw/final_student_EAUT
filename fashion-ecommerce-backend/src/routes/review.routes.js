const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// GET reviews for a product (public)
router.get("/:productId", reviewController.getProductReviews);

// POST a new review for a product (requires auth)
router.post("/:productId", authMiddleware, reviewController.createReview);

module.exports = router;
