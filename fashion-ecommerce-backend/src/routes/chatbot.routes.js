const express = require("express");
const router = express.Router();

const chatbotController = require("../controllers/chatbot.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

/**
 * PUBLIC ROUTES (no auth required)
 */

// Ask chatbot (for widget - public)
router.post("/ask", chatbotController.askChatbot);

/**
 * USER ROUTES (auth required)
 */

// Send message to chatbot
router.post("/send", authMiddleware, chatbotController.sendMessage);

// Get chat history
router.get("/history", authMiddleware, chatbotController.getChatHistory);

// Clear chat history
router.delete("/history", authMiddleware, chatbotController.clearChatHistory);

module.exports = router;
