const Order = require("../models/order.model");
const paymentService = require("../services/payment.service");
const orderService = require("../services/order.service");
const { sendOrderConfirmationEmail } = require("../../email");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create stripe session
const checkout = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        const { returnUrl } = req.body;

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const session = await paymentService.createCheckoutSession(order, returnUrl);

        res.json({
            success: true,
            data: { url: session.url }
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// handle stripe webhook - with error handling & validation
const webhook = async (req, res) => {
    try {
        let event = req.body;

        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (endpointSecret) {
            const signature = req.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
            } catch (signatureErr) {
                console.error('Webhook signature verification failed:', signatureErr.message);
                return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
            }
        }

        // Only process successful checkout sessions
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const orderId = session.metadata?.orderId;

            if (!orderId) {
                console.warn("Webhook: No orderId in metadata");
                return res.json({ received: true });
            }

            try {
                const currentOrder = await Order.findById(orderId);
                if (currentOrder?.paymentStatus === "paid") {
                    console.log(`Order ${orderId} already marked as paid`);
                    return res.json({ received: true });
                }

                await orderService.updatePaymentStatus(orderId, "paid");
                const paidOrder = await orderService.getOrderDetail(orderId);

                // Xóa giỏ hàng database khi thanh toán thành công
                const Cart = require("../models/cart.model");
                const cart = await Cart.findOne({ user: paidOrder.user._id });
                if (cart) {
                    cart.items = [];
                    cart.totalPrice = 0;
                    await cart.save();
                }

                sendOrderConfirmationEmail(paidOrder.user.email, paidOrder).catch((err) => {
                    console.error(`Failed to send payment confirmation email for order ${orderId}:`, err.message);
                });
                console.log(`Order ${orderId} payment marked as paid, cart cleared, and email sent`);
            } catch (dbError) {
                console.error(`Webhook error updating order ${orderId}:`, dbError.message);
                // Still return 200 to prevent Stripe retry
                return res.json({
                    received: true,
                    warning: "Order update failed - will retry"
                });
            }
        }

        res.json({ received: true });

    } catch (err) {
        console.error("Webhook error:", err.message);
        // Return 200 even on error to prevent Stripe retries
        res.status(200).json({ received: true, error: err.message });
    }
};

// API verify session cho trường hợp webhook không chạy (VD: chạy local không ngrok)
const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ success: false, message: "No session id" });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === "paid") {
            const orderId = session.metadata?.orderId;
            if (!orderId) return res.json({ success: false, message: "No order id in session" });

            const currentOrder = await Order.findById(orderId);
            if (currentOrder && currentOrder.paymentStatus !== "paid") {
                await orderService.updatePaymentStatus(orderId, "paid");
                const paidOrder = await orderService.getOrderDetail(orderId);

                // Xóa giỏ hàng database khi thanh toán thành công
                const Cart = require("../models/cart.model");
                const cart = await Cart.findOne({ user: paidOrder.user._id });
                if (cart) {
                    cart.items = [];
                    cart.totalPrice = 0;
                    await cart.save();
                }

                sendOrderConfirmationEmail(paidOrder.user.email, paidOrder).catch((err) => {
                    console.error(`Failed to send payment confirmation email for order ${orderId}:`, err.message);
                });
            }
            return res.json({ success: true, message: "Payment verified and updated" });
        }
        res.json({ success: false, message: "Payment not completed yet" });
    } catch (err) {
        console.error("Verify session error:", err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = { checkout, webhook, verifySession };