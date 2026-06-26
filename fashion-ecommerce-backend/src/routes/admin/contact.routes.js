const express = require("express");
const router = express.Router();
const { getContacts, updateContactStatus, deleteContact } = require("../../controllers/contact.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth.middleware");

// Admin routes for contact/feedback
router.route("/")
    .get(authMiddleware, adminMiddleware, getContacts);

router.route("/:id/status")
    .put(authMiddleware, adminMiddleware, updateContactStatus);

router.route("/:id")
    .delete(authMiddleware, adminMiddleware, deleteContact);

module.exports = router;
