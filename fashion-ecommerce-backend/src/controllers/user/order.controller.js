const orderService = require("../../services/order.service");
const { sendOrderConfirmationEmail } = require("../../../email");

// CREATE ORDER - use service to handle coupon & product snapshot
const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.id, req.body);

        if (order.paymentMethod !== 'stripe') {
            const populatedOrder = await orderService.getOrderDetail(order._id);
            sendOrderConfirmationEmail(req.user.email, populatedOrder).catch((err) => {
                console.error(`Failed to send order confirmation email for order ${order._id}:`, err.message);
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
    try {
        const orders = await orderService.getMyOrders(req.user.id);

        res.json({
            success: true,
            data: orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET ORDER DETAIL
const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderDetail(req.params.id);

        if (order.user._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - this order does not belong to you'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message
        });
    }
};

// CANCEL ORDER
const cancelOrder = async (req, res) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user.id);

        res.json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
};