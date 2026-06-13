const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");
const eventAdminController = require("../../controllers/admin/event.controller");

/**
 * ADMIN EVENT ROUTES
 */
router.get("/", authMiddleware, adminMiddleware, eventAdminController.getAllEvents);
router.get("/:id", authMiddleware, adminMiddleware, eventAdminController.getEventById);
router.post("/", authMiddleware, adminMiddleware, eventAdminController.createEvent);
router.put("/:id", authMiddleware, adminMiddleware, eventAdminController.updateEvent);
router.delete("/:id", authMiddleware, adminMiddleware, eventAdminController.deleteEvent);

module.exports = router;
