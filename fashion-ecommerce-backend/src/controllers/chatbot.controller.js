const chatbotService = require("../services/chatbot.service");

/**
 * POST /api/chatbot/send - Gửi message tới chatbot
 */
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        const { session, botResponse } = await chatbotService.sendMessage(
            req.user._id,
            message
        );

        res.json({
            success: true,
            data: {
                userMessage: message,
                botResponse,
                sessionId: session._id
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * GET /api/chatbot/history - Lấy lịch sử chat
 */
const getChatHistory = async (req, res) => {
    try {
        const messages = await chatbotService.getChatHistory(req.user._id);

        res.json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * DELETE /api/chatbot/history - Xóa lịch sử chat
 */
const clearChatHistory = async (req, res) => {
    try {
        const result = await chatbotService.clearChatHistory(req.user._id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * POST /api/chatbot/ask - Gửi message tới chatbot (không cần auth)
 */
const askChatbot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        const reply = await chatbotService.askChatbot(message);

        res.json({
            success: true,
            reply
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    sendMessage,
    getChatHistory,
    clearChatHistory,
    askChatbot
};
