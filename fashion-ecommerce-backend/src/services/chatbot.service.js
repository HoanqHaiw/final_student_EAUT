const ChatbotSession = require("../models/chatbot.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Coupon = require("../models/coupon.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const orderService = require("./order.service");
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- TOOL FUNCTIONS ---

const searchProducts = async ({ keyword, minPrice, maxPrice, category, size, color }) => {
    try {
        let filter = { isDeleted: false };
        if (keyword) filter.name = { $regex: keyword, $options: "i" };
        if (size) filter["variants.size"] = size;
        if (color) filter["variants.color"] = new RegExp(color, 'i');
        
        let products = await Product.find(filter).populate('category', 'name').limit(10);
        
        if (minPrice || maxPrice) {
            products = products.filter(p => p.variants.some(v => 
                (!minPrice || v.price >= minPrice) && (!maxPrice || v.price <= maxPrice)
            ));
        }

        if (products.length === 0) return { success: true, message: "Không tìm thấy sản phẩm nào phù hợp." };
        
        return {
            success: true,
            products: products.map(p => ({
                id: p._id,
                name: p.name,
                category: p.category?.name || 'Chung',
                price: Math.min(...p.variants.map(v => v.price)),
                url: `${CLIENT_URL}/product/${p._id}`
            }))
        };
    } catch(err) {
        return { success: false, error: err.message };
    }
};

const getOrderStatus = async ({ orderId }) => {
    try {
        const order = await orderService.getOrderDetail(orderId);
        if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };
        return {
            success: true,
            orderId: order._id,
            status: order.status,
            totalPrice: order.finalPrice || order.totalPrice,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            items: order.items.map(item => ({
                name: item.product?.name || item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };
    } catch(err) {
        return { success: false, message: "Lỗi khi tìm đơn hàng." };
    }
};

const getInventory = async ({ threshold = 5 }) => {
    try {
        const products = await Product.find({
            isDeleted: false,
            "variants.stock": { $lte: threshold }
        }).limit(10).populate("category", "name");
        
        if (!products.length) return { success: true, message: `Không có sản phẩm nào tồn kho <= ${threshold}` };
        
        return {
            success: true,
            lowStockItems: products.map(p => ({
                name: p.name,
                variants: p.variants.filter(v => v.stock <= threshold).map(v => ({
                    size: v.size,
                    color: v.color,
                    stock: v.stock
                }))
            }))
        };
    } catch(err) {
        return { success: false, error: err.message };
    }
};

const getCoupons = async () => {
    try {
        const coupons = await Coupon.find().sort({ expiredAt: 1 }).limit(10);
        return {
            success: true,
            coupons: coupons.map(c => ({
                code: c.code,
                value: c.value,
                type: c.type,
                minOrder: c.minOrder,
                isActive: c.isActive,
                expiration: c.expiredAt
            }))
        };
    } catch(err) {
        return { success: false, error: err.message };
    }
};

const getSystemStats = async () => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const revenue = await Order.aggregate([
            { $match: { status: 'delivered', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: { $cond: [ { $ifNull: ["$finalPrice", false] }, "$finalPrice", "$totalPrice" ] } } } }
        ]);
        return {
            success: true,
            users: totalUsers,
            pendingOrders,
            totalRevenue: revenue[0]?.total || 0
        };
    } catch(err) {
        return { success: false, error: err.message };
    }
};

const toolsConfig = {
    customer: [
        {
            type: "function",
            function: {
                name: "searchProducts",
                description: "Tìm kiếm sản phẩm trong database theo các tiêu chí (tên, giá, màu sắc, kích thước). Khi người dùng hỏi về quần áo hợp mệnh, hãy tự suy luận màu sắc và truyền vào color. Ví dụ mệnh hỏa -> color: 'đỏ'.",
                parameters: {
                    type: "object",
                    properties: {
                        keyword: { type: "string", description: "Từ khóa tên sản phẩm (áo, quần, váy...)" },
                        minPrice: { type: "number", description: "Giá tối thiểu" },
                        maxPrice: { type: "number", description: "Giá tối đa" },
                        size: { type: "string", description: "Kích thước (S, M, L, XL, XXL). Tự quy đổi nếu người dùng nhập kg." },
                        color: { type: "string", description: "Màu sắc (ví dụ: đen, đỏ, trắng...)" },
                    }
                }
            }
        },
        {
            type: "function",
            function: {
                name: "getOrderStatus",
                description: "Lấy trạng thái và chi tiết đơn hàng bằng Mã đơn hàng (ID).",
                parameters: {
                    type: "object",
                    properties: {
                        orderId: { type: "string", description: "Mã đơn hàng 24 ký tự hex" }
                    },
                    required: ["orderId"]
                }
            }
        }
    ],
    staff: [
        {
            type: "function",
            function: {
                name: "getInventory",
                description: "Kiểm tra danh sách các sản phẩm sắp hết hàng (tồn kho thấp).",
                parameters: {
                    type: "object",
                    properties: {
                        threshold: { type: "number", description: "Số lượng tồn kho tối đa để cảnh báo (mặc định 5)" }
                    }
                }
            }
        }
    ],
    admin: [
        {
            type: "function",
            function: {
                name: "getCoupons",
                description: "Lấy danh sách mã giảm giá (coupon) hiện tại trong hệ thống.",
                parameters: { type: "object", properties: {} }
            }
        },
        {
            type: "function",
            function: {
                name: "getSystemStats",
                description: "Lấy báo cáo tổng quan hệ thống (số người dùng, đơn hàng chờ xử lý, doanh thu).",
                parameters: { type: "object", properties: {} }
            }
        }
    ]
};

// --- CHATBOT CORE ---

const generateBotResponse = async (userMessage, role = 'customer', sessionMessages = []) => {
    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
        return { text: "Xin lỗi, API Key chưa được cấu hình." };
    }

    try {
        let roleTools = [...toolsConfig.customer];
        if (role === 'staff' || role === 'admin') {
            roleTools = [...roleTools, ...toolsConfig.staff];
        }
        if (role === 'admin') {
            roleTools = [...roleTools, ...toolsConfig.admin];
        }

        const systemPrompt = role === 'admin'
            ? 'Bạn là AI trợ lý quản trị viên. Hãy dùng tools để lấy dữ liệu. Trả lời rõ ràng, chính xác. Nếu là thông tin sản phẩm, luôn đính kèm URL.'
            : role === 'staff'
                ? 'Bạn là AI trợ lý nhân viên kho/đơn. Chỉ hỗ trợ đơn hàng và kho. Từ chối câu hỏi doanh thu. Trả lời ngắn gọn, chuyên nghiệp.'
                : 'Bạn là AI trợ lý bán hàng thân thiện. Hãy phân tích yêu cầu (như cân nặng -> size, mệnh -> màu) và dùng tool searchProducts. Trả lời nhiệt tình, thân thiện, DÙNG ĐỊNH DẠNG MARKDOWN CHO LINK KHI GỢI Ý SẢN PHẨM: [Tên Sản phẩm](URL).';

        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            // Keep last 4 messages for context
            ...sessionMessages.slice(-4).map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.message })),
            { role: 'user', content: userMessage }
        ];

        const response = await openai.chat.completions.create({
            model: 'gemini-2.5-flash',
            messages: messages,
            tools: roleTools,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        // If no tool call, return the direct text
        if (!responseMessage.tool_calls) {
            return { text: responseMessage.content || "Xin lỗi, tôi không thể trả lời lúc này." };
        }

        // Handle tool calls
        messages.push(responseMessage); // add the assistant's tool call request

        for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            let functionResult = {};
            if (functionName === "searchProducts") functionResult = await searchProducts(functionArgs);
            else if (functionName === "getOrderStatus") functionResult = await getOrderStatus(functionArgs);
            else if (functionName === "getInventory") functionResult = await getInventory(functionArgs);
            else if (functionName === "getCoupons") functionResult = await getCoupons();
            else if (functionName === "getSystemStats") functionResult = await getSystemStats();

            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: JSON.stringify(functionResult),
            });
        }

        // Get final response from OpenAI after providing tool results
        const finalResponse = await openai.chat.completions.create({
            model: 'gemini-2.5-flash',
            messages: messages,
        });

        return { text: finalResponse.choices[0].message.content };
    } catch (error) {
        console.error('OpenAI error:', error);
        return { text: "Đã có lỗi xảy ra khi kết nối tới hệ thống AI. Vui lòng thử lại sau." };
    }
};

// --- SESSION MANAGEMENT ---

const getOrCreateSession = async (userId) => {
    let session = await ChatbotSession.findOne({ user: userId, isActive: true });
    if (!session) {
        session = await ChatbotSession.create({ user: userId, messages: [] });
    }
    return session;
};

const sendMessage = async (userId, userMessage) => {
    if (!userMessage || !userMessage.trim()) throw new Error("Message cannot be empty");

    const session = await getOrCreateSession(userId);
    
    // We pass session messages for context
    const botResponse = await generateBotResponse(userMessage, 'customer', session.messages);
    
    session.messages.push({ sender: "user", message: userMessage });
    session.messages.push({ sender: "bot", message: botResponse.text });
    await session.save();

    return { session, botResponse };
};

const getChatHistory = async (userId) => {
    const session = await ChatbotSession.findOne({ user: userId, isActive: true });
    return session ? session.messages : [];
};

const clearChatHistory = async (userId) => {
    await ChatbotSession.findOneAndUpdate({ user: userId, isActive: true }, { isActive: false });
    return { message: "Chat history cleared" };
};

const askChatbot = async (userMessage) => {
    if (!userMessage || !userMessage.trim()) throw new Error("Message cannot be empty");
    return generateBotResponse(userMessage, 'customer');
};

const askAdminChatbot = async (adminId, userMessage, role = 'admin') => {
    if (!userMessage || !userMessage.trim()) throw new Error("Message cannot be empty");
    
    // Admins might also have a session, but usually admin chatbot in this app doesn't save to DB.
    // For simplicity, we just respond statelessly as before.
    return generateBotResponse(userMessage, role);
};

module.exports = {
    sendMessage,
    getChatHistory,
    clearChatHistory,
    askChatbot,
    askAdminChatbot
};
