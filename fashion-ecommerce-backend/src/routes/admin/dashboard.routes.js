const express = require("express");
const router = express.Router();

const dashboardController = require("../../controllers/dashboard.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");

// chỉ admin mới xem được
router.get("/overview", authMiddleware, adminMiddleware, dashboardController.overview);
router.get("/top-products", authMiddleware, adminMiddleware, dashboardController.topProducts);
router.get("/export", authMiddleware, adminMiddleware, dashboardController.exportRevenue);

module.exports = router;