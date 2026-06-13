const authService = require("../services/auth.service");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/auth/verify-email?token=xxx (legacy, keep for backward compatibility)
// POST /api/auth/verify-email { email, code }
const verifyEmail = async (req, res) => {
    try {
        let data;
        if (req.method === 'GET') {
            // Legacy support for token-based verification
            const token = req.query.token;
            if (!token) throw new Error("Token không hợp lệ");
            // For legacy, we can't verify without email, so return error
            throw new Error("Phương thức xác nhận cũ không còn hỗ trợ. Vui lòng sử dụng mã xác nhận.");
        } else {
            // New method: POST with email and code
            data = req.body;
        }
        await authService.verifyEmail(data);
        res.json({ message: "Xác thực email thành công. Bạn có thể đăng nhập." });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        const token = generateToken(user);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };