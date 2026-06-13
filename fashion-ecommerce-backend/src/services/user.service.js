const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// ─── ADMIN: lấy danh sách tất cả user ─────────────────────────────────────
const getAllUsers = async (query = {}) => {
    const { keyword } = query;

    let filter = { role: { $ne: "admin" } };

    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } }
        ];
    }

    return await User.find(filter)
        .select("-password -verifyToken -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 });
};

// ─── ADMIN: lấy chi tiết user ─────────────────────────────────────────────
const getUserById = async (id) => {
    const user = await User.findById(id).select("-password -verifyToken -resetPasswordToken -resetPasswordExpires");
    if (!user) throw new Error("User not found");
    return user;
};

// ─── ADMIN: khóa / mở khóa tài khoản ───────────────────────────────────────
const toggleBlockUser = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Không thể khóa tài khoản admin");

    user.isBlocked = !user.isBlocked;
    await user.save();

    return {
        message: user.isBlocked ? "Tài khoản đã bị khóa" : "Tài khoản đã được mở khóa",
        isBlocked: user.isBlocked
    };
};

// ─── USER: lấy profile của mình ────────────────────────────────────────────
const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password -verifyToken -resetPasswordToken -resetPasswordExpires");
    if (!user) throw new Error("User not found");
    return user;
};

// ─── USER: cập nhật profile ───────────────────────────────────────────────
const updateProfile = async (userId, data) => {
    const { name, email, phone } = data;

    // Check if email already exists (and it's not the same user)
    if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) throw new Error("Email already exists");
    }

    const update = { name, email };
    if (phone !== undefined) update.phone = phone;

    const user = await User.findByIdAndUpdate(
        userId,
        update,
        { new: true }
    ).select("-password -verifyToken -resetPasswordToken -resetPasswordExpires");

    if (!user) throw new Error("User not found");
    return user;
};

// ─── USER: đổi mật khẩu ──────────────────────────────────────────────────
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password changed successfully" };
};

const updateUser = async (id, data) => {
    const { name, email, role } = data;

    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    if (user.role === "admin" && role !== "admin") {
        throw new Error("Không thể thay đổi quyền của admin");
    }

    if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) throw new Error("Email already exists");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (role) user.role = role;
    await user.save();

    return user.toObject({ versionKey: false });
};

const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Không thể xóa admin");
    await user.deleteOne();
    return { success: true };
};

module.exports = {
    getAllUsers,
    getUserById,
    toggleBlockUser,
    getProfile,
    updateProfile,
    changePassword,
    updateUser,
    deleteUser
};