const chatbotService = require("../../services/chatbot.service");

const askAdminChatbot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        const reply = await chatbotService.askAdminChatbot(req.user._id, message, req.user.role);

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

module.exports = { askAdminChatbot };
