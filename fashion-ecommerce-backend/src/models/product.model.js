const mongoose = require("mongoose");

// variant (size + color + price + stock)
const variantSchema = new mongoose.Schema({
    size: String,
    color: String,
    price: Number,
    stock: Number
});

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,

        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

        images: [String],

        variants: [variantSchema],

        discountPercent: { type: Number, min: 0, max: 100, default: 0 },

        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);