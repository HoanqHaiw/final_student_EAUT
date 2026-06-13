
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (order) => {
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

        success_url: `${process.env.CLIENT_URL}/orders`,
        cancel_url: `${process.env.CLIENT_URL}/checkout`,

        metadata: {
            orderId: order._id.toString()
        }
    });

    return session;
};

module.exports = { createCheckoutSession };