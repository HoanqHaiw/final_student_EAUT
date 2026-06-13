const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    size: String,
    color: String,
    quantity: Number
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [orderItemSchema],

    phone: { type: String, default: '' },

        totalPrice: { type: Number, required: true },

        discount: { type: Number, default: 0 },

        finalPrice: { type: Number, required: true },

        shippingFee: { type: Number, default: 0 },

        coupon: { type: String, default: null },

        status: {
            type: String,
            enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
            default: "pending"
        },

        // trạng thái thanh toán
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "refunded"],
            default: "unpaid"
        },

        // phương thức thanh toán
        paymentMethod: {
            type: String,
            enum: ["cod", "stripe", "bank_transfer"],
            default: "cod"
        },

        shippingMethod: {
            type: String,
            enum: ["standard", "express", "overnight"],
            default: "standard"
        },

        trackingNumber: { type: String, default: null },

        returnStatus: {
            type: String,
            enum: ["none", "requested", "approved", "rejected", "returned"],
            default: "none"
        },

        returnReason: { type: String, default: null },

        shippingAddress: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);