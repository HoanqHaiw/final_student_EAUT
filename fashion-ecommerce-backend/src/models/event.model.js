const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },
        details: { type: [String], default: [] },
        ctaLabel: { type: String, default: "Khám phá" },
        ctaLink: { type: String, default: "/products" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
