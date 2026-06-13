const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const { validateUpdateProfile } = require("../middlewares/validation.middleware");
const userController = require("../controllers/user/user.controller");
const profileController = require("../controllers/user/profile.controller");

/**
 * PUBLIC ROUTES
 */
// None yet

/**
 * USER ROUTES (auth required)
 */

// Get profile
router.get("/profile", authMiddleware, profileController.getProfile);

// Update profile
router.put(
    "/profile",
    authMiddleware,
    validateUpdateProfile,
    profileController.updateProfile
);

// Change password
router.post(
    "/change-password",
    authMiddleware,
    profileController.changePassword
);

// Get my orders (alias)
router.get("/orders", authMiddleware, (req, res) => {
    res.redirect(`/api/orders/my`);
});

/**
 * ADMIN ROUTES (admin only)
 */

// Get all users
router.get(
    "/admin/list",
    authMiddleware,
    adminMiddleware,
    userController.getAllUsers
);

// Get user by id
router.get(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    userController.getUserById
);

// Toggle block user
router.patch(
    "/admin/:id/toggle-block",
    authMiddleware,
    adminMiddleware,
    userController.toggleBlockUser
);

module.exports = router;
