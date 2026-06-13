const userService = require("../../services/user.service");

/**
 * USER ENDPOINTS
 */

// GET /api/users/profile - lấy profile của user đang đăng nhập
const getProfile = async (req, res) => {
    try {
        const profile = await userService.getProfile(req.user._id);
        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/users/profile - cập nhật profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await userService.updateProfile(req.user._id, { name, email, phone });
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/users/change-password - đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const result = await userService.changePassword(req.user._id, oldPassword, newPassword);
        res.json({
            success: true,
            message: result.message
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
