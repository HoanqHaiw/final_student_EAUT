const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");
const { validateCategory } = require("../../middlewares/validation.middleware");
const categoryController = require("../../controllers/category.controller");

/**
 * ADMIN ONLY ROUTES
 * All routes require: authMiddleware + adminMiddleware
 */

// GET all categories
router.get("/", authMiddleware, adminMiddleware, categoryController.getCategories);

// GET category by id
router.get("/:id", authMiddleware, adminMiddleware, categoryController.getCategoryById);

// CREATE category
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validateCategory,
    categoryController.createCategory
);

// UPDATE category
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validateCategory,
    categoryController.updateCategory
);

// DELETE category
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    categoryController.deleteCategory
);

module.exports = router;
