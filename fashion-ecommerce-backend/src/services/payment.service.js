
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (order, returnUrl) => {
    const baseUrl = returnUrl || process.env.CLIENT_URL;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],

        line_items: order.items.map((item) => ({
            price_data: {
                currency: "vnd",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price)
            },
            quantity: item.quantity
        })),

        mode: "payment",

        success_url: `${baseUrl}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?cancel_stripe=true&order_id=${order._id.toString()}`,

        metadata: {
            orderId: order._id.toString()
        }
    });

    return session;
};

module.exports = { createCheckoutSession };