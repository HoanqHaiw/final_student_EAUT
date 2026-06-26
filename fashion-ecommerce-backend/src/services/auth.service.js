const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { sendVerifyEmail, sendResetPasswordEmail } = require("../../email");

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (data) => {
    const { name, email, password, phone } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    // tạo mã xác nhận 6 số
    const verifyToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        verifyToken,
        verifyTokenExpires
    });

    // Gửi email và chờ kết quả. Nếu lỗi sẽ báo thẳng ra màn hình Frontend
    try {
        await sendVerifyEmail(email, verifyToken);
    } catch (err) {
        // Xóa user vừa tạo nếu gửi mail thất bại để họ có thể đăng ký lại
        await User.findByIdAndDelete(user._id);
        throw new Error("Lỗi gửi email xác nhận. Vui lòng kiểm tra lại cấu hình Email: " + err.message);
    }

    return user;
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (data) => {
    const { email, code } = data;

    const user = await User.findOne({
        email,
        verifyToken: code,
        verifyTokenExpires: { $gt: new Date() }
    });

    if (!user) throw new Error("Mã xác nhận không hợp lệ hoặc đã hết hạn");

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;
    await user.save();

    return user;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    if (!user.isVerified) throw new Error("Vui lòng xác thực email trước khi đăng nhập");

    if (user.isBlocked) throw new Error("Tài khoản của bạn đã bị khóa");

    return user;
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await sendResetPasswordEmail(email, resetToken);

    return { message: "Email đặt lại mật khẩu đã được gửi" };
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (token, newPassword) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) throw new Error("Token không hợp lệ hoặc đã hết hạn");

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: "Mật khẩu đã được đặt lại thành công" };
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };