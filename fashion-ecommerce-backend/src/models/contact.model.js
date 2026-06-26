const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: '' },
        message: { type: String, required: true },
        status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
