const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

const productController = require("../controllers/product.controller");

// middleware
const {
    authMiddleware,
    adminMiddleware,
    staffMiddleware
} = require("../middlewares/auth.middleware");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary (Lấy từ biến môi trường)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "fashion_ecommerce",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
    }
});

const upload = multer({ storage });

// upload images (admin)
router.post(
    "/upload",
    authMiddleware,
    adminMiddleware,
    upload.array("images", 10),
    (req, res) => {
        try {
            // Cloudinary trả về URL thẳng trong req.file.path
            const urls = req.files.map((file) => file.path);
            res.json({ urls });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// CREATE (admin)
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    productController.createProduct
);

// GET ALL
router.get("/", productController.getProducts);

// GET DETAIL
router.get("/:id", productController.getProduct);

// UPDATE (admin / staff for inventory updates)
router.put(
    "/:id",
    authMiddleware,
    staffMiddleware,
    productController.updateProduct
);

// DELETE (admin)
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    productController.deleteProduct
);

module.exports = router;