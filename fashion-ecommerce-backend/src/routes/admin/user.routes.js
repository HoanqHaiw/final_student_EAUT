const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/user.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");

// tất cả route đều cần admin
router.use(authMiddleware, adminMiddleware);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/toggle-block", userController.toggleBlockUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;