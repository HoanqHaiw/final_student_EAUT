const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ["user", "bot"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatbotSessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messages: [chatMessageSchema],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatbotSession", chatbotSessionSchema);
