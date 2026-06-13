const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.route("/verify-email").get(authController.verifyEmail).post(authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// lấy thông tin user đang đăng nhập
router.get("/me", authMiddleware, (req, res) => {
    const { password, verifyToken, resetPasswordToken, resetPasswordExpires, ...safe } = req.user.toObject();
    res.json(safe);
});

module.exports = router;