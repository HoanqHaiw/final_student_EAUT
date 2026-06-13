const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

// public
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// admin only
router.post("/", authMiddleware, adminMiddleware, categoryController.createCategory);
router.put("/:id", authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;