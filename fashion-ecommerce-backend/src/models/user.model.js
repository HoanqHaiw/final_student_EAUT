const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        phone: { type: String, default: '' },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "staff", "admin"], default: "user" },

        // email verification
        isVerified: { type: Boolean, default: false },
        verifyToken: { type: String, default: null },
        verifyTokenExpires: { type: Date, default: null },

        // forgot password
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },

        // account status
        isBlocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);