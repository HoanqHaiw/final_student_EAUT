/**
 * Validation Middleware - Kiểm tra request body
 */

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

// Register validation
const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password || !validatePassword(password)) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    next();
};

// Login validation
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    next();
};

// Product validation
const validateProduct = (req, res, next) => {
    const { name, variants, category } = req.body;

    if (!name || name.trim().length < 3) {
        return res.status(400).json({ message: "Product name must be at least 3 characters" });
    }

    if (!category || category.trim().length < 1) {
        return res.status(400).json({ message: "Category is required" });
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ message: "At least one variant is required" });
    }

    // Check each variant
    for (let variant of variants) {
        if (!variant.size || !variant.color || !variant.price || variant.stock === undefined) {
            return res.status(400).json({ message: "Each variant must have size, color, price, and stock" });
        }
        if (typeof variant.price !== "number" || variant.price <= 0) {
            return res.status(400).json({ message: "Variant price must be a positive number" });
        }
        if (typeof variant.stock !== "number" || variant.stock < 0) {
            return res.status(400).json({ message: "Variant stock must be a non-negative number" });
        }
    }

    next();
};

// Category validation
const validateCategory = (req, res, next) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Category name must be at least 2 characters" });
    }

    next();
};

// Coupon validation
const validateCoupon = (req, res, next) => {
    const { code, type, value, minOrder } = req.body;

    if (!code || code.trim().length < 2) {
        return res.status(400).json({ message: "Coupon code is required" });
    }

    if (!type || !["percent", "fixed"].includes(type)) {
        return res.status(400).json({ message: "Type must be 'percent' or 'fixed'" });
    }

    if (typeof value !== "number" || value <= 0) {
        return res.status(400).json({ message: "Value must be a positive number" });
    }

    if (type === "percent" && value > 100) {
        return res.status(400).json({ message: "Percent discount cannot exceed 100%" });
    }

    if (minOrder && typeof minOrder !== "number") {
        return res.status(400).json({ message: "Minimum order must be a number" });
    }

    next();
};

// Order validation
const validateOrder = (req, res, next) => {
    const { shippingAddress } = req.body;

    if (!shippingAddress || shippingAddress.trim().length < 5) {
        return res.status(400).json({ message: "Shipping address is required" });
    }

    next();
};

// Update profile validation
const validateUpdateProfile = (req, res, next) => {
    const { name, email } = req.body;

    if (name && name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (email && !validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProduct,
    validateCategory,
    validateCoupon,
    validateOrder,
    validateUpdateProfile
};
