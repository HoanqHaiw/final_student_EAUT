const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");

router.get("/export", authMiddleware, adminMiddleware, productController.exportProducts);

module.exports = router;
