const express = require("express");
const router = express.Router();
const chatbotAdminController = require("../../controllers/admin/chatbot.controller");
const { authMiddleware, staffMiddleware } = require("../../middlewares/auth.middleware");

router.post("/ask", authMiddleware, staffMiddleware, chatbotAdminController.askAdminChatbot);

module.exports = router;
