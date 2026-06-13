const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// xác thực token JWT
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password -verifyToken -resetPasswordToken -resetPasswordExpires");

        if (!user) return res.status(401).json({ message: "User not found" });

        // kiểm tra tài khoản bị khóa
        if (user.isBlocked) {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// chỉ cho phép admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};

// cho phép admin hoặc staff
const staffMiddleware = (req, res, next) => {
    if (req.user.role !== "staff" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Staff or admin only" });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, staffMiddleware };