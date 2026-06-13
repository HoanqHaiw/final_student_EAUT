require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const app = express();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// connect DB
connectDB();

// middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan("dev"));

// stripe webhook cần raw body → đặt TRƯỚC express.json()
app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" })
);

app.use(express.json());

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));

// ─── PRODUCT & CATEGORY (public read, admin write) ───────────────────────
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/reviews", require("./routes/review.routes"));

// ─── USER ROUTES (includes admin user management) ────────────────────────
app.use("/api/users", require("./routes/user.routes"));

// ─── CART & ORDERS & PAYMENTS (auth required) ─────────────────────────────
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/payments", require("./routes/payment.routes"));

// ─── CHATBOT (auth required) ──────────────────────────────────────────────
app.use("/api/chatbot", require("./routes/chatbot.routes"));

// ─── ADMIN ROUTES (admin only) ────────────────────────────────────────────
app.use("/api/admin", require("./routes/admin"));

// ─── LEGACY: PUBLIC COUPON VALIDATION ─────────────────────────────────────
app.use("/api/coupons", require("./routes/coupon.routes"));

// ─── ERROR HANDLING ───────────────────────────────────────────────────────
const { errorHandler, notFound } = require("./middlewares/error.middleware");

// health check
app.get("/", (req, res) => res.send("API is running..."));

// 404 Not Found
app.use(notFound);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));