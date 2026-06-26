const Order = require("../models/order.model");
const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const couponService = require("./coupon.service");

const calculateShippingFee = (totalPrice, shippingAddress) => {
    if (totalPrice >= 1000000) return 0;

    const addressParts = shippingAddress.split(',').map((part) => part.trim()).filter(Boolean);
    const province = addressParts[addressParts.length - 2] || '';
    const majorCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];

    return majorCities.includes(province) ? 30000 : 50000;
};

// CREATE ORDER
const createOrder = async (userId, data) => {
    const { shippingAddress, phone, couponCode, cartItems, paymentMethod = 'cod' } = data;

    let orderItems = [];
    let totalPrice = 0;
    let useCartItemsFromRequest = Array.isArray(cartItems) && cartItems.length > 0;

    if (useCartItemsFromRequest) {
        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error("Product not found");
            }

            const variant = product.variants.find(
                (v) => v.size === item.size && v.color === item.color
            );
            if (!variant) {
                throw new Error("Product variant not found");
            }

            const originalPrice = item.price || variant.price;
            const price = Math.round(originalPrice * (1 - (product.discountPercent || 0) / 100));
            const quantity = Number(item.quantity) || 1;

            if (variant.stock < quantity) {
                throw new Error(`Not enough stock for ${product.name} (Size: ${item.size}, Color: ${item.color})`);
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price,
                size: item.size,
                color: item.color,
                quantity
            });
            totalPrice += price * quantity;
        }
    } else {
        // 1. lấy cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        // 2. build order items (snapshot)
        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                throw new Error("Product not found");
            }

            const variant = product.variants.find(
                (v) => v.size === item.size && v.color === item.color
            );

            if (!variant) {
                throw new Error("Product variant not found");
            }

            if (variant.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name} (Size: ${item.size}, Color: ${item.color})`);
            }

            const finalPrice = Math.round(variant.price * (1 - (product.discountPercent || 0) / 100));

            orderItems.push({
                product: product._id,
                name: product.name,
                price: finalPrice,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            });
            totalPrice += finalPrice * item.quantity;
        }

    }

    // 3. xử lý coupon
    let discount = 0;
    let couponUsed = null;

    if (couponCode) {
        const result = await couponService.validateCoupon(
            couponCode,
            totalPrice
        );

        discount = result.discount;
        couponUsed = result.coupon;

        // Đối với đơn Stripe, chỉ tăng usage khi thanh toán thành công.
        if (paymentMethod !== 'stripe') {
            await couponService.increaseUsage(couponUsed._id);
        }
    }

    // 4. tính phí ship và final price
    const shippingFee = calculateShippingFee(totalPrice, shippingAddress);
    const finalPrice = totalPrice - discount + shippingFee;

    // 5. tạo order
    const user = await User.findById(userId);
    const order = new Order({
        user: userId,
        phone: phone || user?.phone || '',
        items: orderItems,
        totalPrice,
        discount,
        shippingFee,
        finalPrice,
        coupon: couponUsed ? couponUsed.code : null,
        shippingAddress,
        paymentMethod,
        status: "pending"
    });

    await order.save();

    // 5.5. deduct stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            const variant = product.variants.find(
                (v) => v.size === item.size && v.color === item.color
            );
            if (variant) {
                variant.stock -= item.quantity;
                await product.save();
            }
        }
    }

    // 6. clear cart if backend cart was used AND payment is not stripe
    // (Stripe orders will clear cart in the webhook upon success)
    if (!useCartItemsFromRequest && paymentMethod !== 'stripe') {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
        }
    }

    return order;
};

// GET MY ORDERS
const getMyOrders = async (userId) => {
    return await Order.find({ user: userId })
        .populate("user", "email name phone")
        .populate("items.product", "name images price")
        .sort({ createdAt: -1 });
};

// ADMIN: GET ALL
const getAllOrders = async () => {
    return await Order.find()
        .populate("user", "email name phone")
        .populate("items.product", "name images price")
        .sort({ createdAt: -1 });
};

// ADMIN: GET ORDERS WITH FILTERS & PAGINATION
const getOrdersAdmin = async (query) => {
    const { page = 1, limit = 10, status, paymentStatus } = query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
        .populate("user", "email name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    return {
        orders,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
    };
};

// GET ORDER DETAIL
const getOrderDetail = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate("user", "email name phone")
        .populate("items.product", "name images");

    if (!order) throw new Error("Order not found");

    return order;
};

// UPDATE STATUS
const updateStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    order.status = status;

    return await order.save();
};

// ADMIN: UPDATE ORDER STATUS (Alias for admin)
const updateOrderStatus = async (orderId, status) => {
    const validStatuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    order.status = status;

    if (status === "confirmed" && order.paymentMethod === "bank_transfer") {
        order.paymentStatus = "paid";
    }

    return await order.save();
};

// UPDATE PAYMENT STATUS & ORDER STATUS
const updatePaymentStatus = async (orderId, paymentStatus) => {
    const validStatuses = ["unpaid", "paid", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
        throw new Error(`Invalid payment status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    order.paymentStatus = paymentStatus;

    if (paymentStatus === "paid" && order.status === "pending") {
        order.status = "confirmed";
    }

    if (paymentStatus === "refunded") {
        order.status = "cancelled";
    }

    return await order.save();
};

const updateShippingInfo = async (orderId, data) => {
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    if (data.shippingMethod) {
        order.shippingMethod = data.shippingMethod;
    }

    if (data.trackingNumber !== undefined) {
        order.trackingNumber = data.trackingNumber || null;
    }

    if (order.trackingNumber && order.status === "confirmed") {
        order.status = "shipping";
    }

    return await order.save();
};

const updateReturnStatus = async (orderId, returnStatus, reason) => {
    const validReturnStatuses = ["none", "requested", "approved", "rejected", "returned"];
    if (!validReturnStatuses.includes(returnStatus)) {
        throw new Error(`Invalid return status. Must be one of: ${validReturnStatuses.join(", ")}`);
    }

    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    order.returnStatus = returnStatus;
    order.returnReason = reason || order.returnReason;

    if (returnStatus === "approved" || returnStatus === "returned") {
        order.status = "cancelled";
        order.paymentStatus = "refunded";
    }

    return await order.save();
};

// CANCEL ORDER
const cancelOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId);

    if (!order) throw new Error("Order not found");

    // Verify ownership
    if (order.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized - not your order");
    }

    // Can only cancel pending orders
    if (order.status !== "pending") {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Restore coupon usage if was used and it was already counted
    if (order.coupon && (order.paymentMethod !== "stripe" || order.paymentStatus === "paid")) {
        try {
            await couponService.decreaseUsage(order.coupon);
        } catch (err) {
            console.warn(`Failed to restore coupon usage for ${order.coupon}:`, err.message);
        }
    }

    order.status = "cancelled";
    order.paymentStatus = "refunded";

    const savedOrder = await order.save();

    // Restore stock
    for (const item of savedOrder.items) {
        const product = await Product.findById(item.product);
        if (product) {
            const variant = product.variants.find(
                (v) => v.size === item.size && v.color === item.color
            );
            if (variant) {
                variant.stock += item.quantity;
                await product.save();
            }
        }
    }

    return savedOrder;
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrdersAdmin,
    getOrderDetail,
    updateStatus,
    updateOrderStatus,
    updatePaymentStatus,
    updateShippingInfo,
    updateReturnStatus,
    cancelOrder
};