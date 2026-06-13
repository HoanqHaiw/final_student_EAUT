const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// add to cart
const addToCart = async (userId, data) => {
    const { productId, size, color, quantity } = data;

    if (!productId) {
        throw new Error("Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }

    // Nếu có size/color, kiểm tra variant tồn tại
    let variant = null;
    if (size && color) {
        variant = product.variants.find(
            (v) => v.size === size && v.color === color
        );
        if (!variant) throw new Error("Variant not found");
    } else {
        // Sử dụng variant đầu tiên nếu không có size/color
        variant = product.variants[0];
        if (!variant) throw new Error("Product has no variants");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
        (item) =>
            item.product.toString() === productId &&
            item.size === (size || variant.size) &&
            item.color === (color || variant.color)
    );

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (newQuantity > variant.stock) {
        throw new Error(`Not enough stock. Available: ${variant.stock}`);
    }

    const finalPrice = Math.round(variant.price * (1 - (product.discountPercent || 0) / 100));

    if (existingItem) {
        existingItem.quantity = newQuantity;
        existingItem.price = finalPrice;
    } else {
        cart.items.push({
            product: productId,
            size: size || variant.size,
            color: color || variant.color,
            quantity,
            price: finalPrice
        });
    }

    //  total
    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return await cart.save();
};

// get cart
const getCart = async (userId) => {
    return await Cart.findOne({ user: userId }).populate("product");
};

// remove item
const removeItem = async (userId, itemId) => {
    const cart = await Cart.findOne({ user: userId });

    cart.items = cart.items.filter(
        (item) => item._id.toString() !== itemId
    );

    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return await cart.save();
};

module.exports = {
    addToCart,
    getCart,
    removeItem
};