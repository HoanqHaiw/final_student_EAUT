import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const CHATBOT_STORAGE_KEY = 'chatbot_widget_messages';

const userQuestionsPool = [
    "Tìm áo thun nam",
    "Chính sách đổi trả",
    "Làm sao thanh toán?",
    "Phí giao hàng bao nhiêu?",
    "Áo khoác mùa đông",
    "Kiểm tra tình trạng đơn hàng",
    "Cách chọn size quần áo",
    "Mệnh thủy hợp áo màu gì?",
    "Mệnh hỏa nên mặc màu gì?",
    "Có đồ thể thao không?",
    "Giờ làm việc của shop?"
];

const getRandomQuestions = (pool, count, exclude = []) => {
    const available = pool.filter(q => !exclude.includes(q));
    const finalPool = available.length >= count ? available : pool.filter(q => q !== exclude[0]);
    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const initialBotMessage = {
    id: 1,
    text: "Xin chào! 👋 Tôi là trợ lý AI của cửa hàng thời trang. Tôi có thể giúp bạn với gì?",
    sender: 'bot',
    timestamp: new Date(),
};

const normalizeMessage = (msg) => ({
    ...msg,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
});

const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
        const isUrl = /^(https?:\/\/[^\s]+)$/i.test(part);
        if (isUrl) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 underline break-words"
                >
                    {part}
                </a>
            );
        }
        return part.split('\n').map((line, lineIndex, arr) => (
            <span key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < arr.length - 1 ? <br /> : null}
            </span>
        ));
    });
};

export default function ChatbotWidget() {
    const { token } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([initialBotMessage]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setSuggestedQuestions(getRandomQuestions(userQuestionsPool, 3));
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const savedMessages = localStorage.getItem(CHATBOT_STORAGE_KEY);
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                if (Array.isArray(parsed) && parsed.length) {
                    setMessages(parsed.map(normalizeMessage));
                }
            } catch (error) {
                console.error('Failed to parse saved chatbot messages:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (!isOpen || !token) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await api.get('/chatbot/history');
                if (response.data?.success) {
                    const historyMessages = response.data.data.map((item, index) => ({
                        id: index + 2,
                        text: item.message,
                        sender: item.sender,
                        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
                    }));
                    setMessages([initialBotMessage, ...historyMessages]);
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen, token]);

    const handleSendMessage = async (e, directText = null) => {
        if (e) e.preventDefault();
        const textToSend = typeof directText === 'string' ? directText : inputValue;
        if (!textToSend.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: textToSend,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        if (typeof directText !== 'string') setInputValue('');
        setLoading(true);
        setSuggestedQuestions(getRandomQuestions(userQuestionsPool, 3, [textToSend, ...suggestedQuestions]));

        try {
            const endpoint = token ? '/chatbot/send' : '/chatbot/ask';
            const response = await api.post(endpoint, { message: textToSend });

            const responseData = response.data?.data?.botResponse || response.data?.reply;
            const botText = typeof responseData === 'string'
                ? responseData
                : responseData?.text || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
            const botProducts = typeof responseData === 'object' && responseData?.products ? responseData.products : response.data?.data?.products;

            const botMessage = {
                id: userMessage.id + 1,
                text: botText,
                sender: 'bot',
                timestamp: new Date(),
                products: botProducts,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage = {
                id: messages.length + 2,
                text: 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (token) {
            try {
                await api.delete('/chatbot/history');
            } catch (error) {
                console.error('Failed to clear remote chat history:', error);
            }
        }

        setMessages([initialBotMessage]);
        localStorage.removeItem(CHATBOT_STORAGE_KEY);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white border border-neutral-800 rounded-none shadow-2xl hover:bg-neutral-900 transform hover:scale-105 active:scale-95 transition-all duration-300 z-40 flex items-center justify-center text-lg font-bold"
                title="Chat với AI"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[480px] max-h-[80vh] bg-white rounded-none shadow-2xl flex flex-col z-40 border border-black animate-fadeIn">
                    <div className="bg-black text-white px-4 py-3.5 flex justify-between items-center border-b border-black">
                        <div>
                            <h3 className="font-heading uppercase tracking-widest text-xs font-bold">Trợ lý thời trang 👗</h3>
                            <p className="text-[9px] uppercase tracking-wider text-neutral-400 mt-0.5">Luôn sẵn sàng giúp bạn</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:text-neutral-400 p-1.5 transition text-xs font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-3.5 py-2.5 rounded-none border text-xs leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-black text-white border-black rounded-br-none'
                                            : 'bg-neutral-50 text-black border-neutral-200 rounded-bl-none'
                                    }`}
                                >
                                    <div className="break-words whitespace-pre-wrap tracking-wide">
                                        {renderMessageContent(msg.text)}
                                    </div>
                                    {msg.products?.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-dashed border-neutral-300 pt-2">
                                            {msg.products.map((product) => (
                                                <a
                                                    key={product.id}
                                                    href={product.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block text-black hover:opacity-70 font-semibold underline text-[11px]"
                                                >
                                                    {product.name} - {product.priceText}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[9px] opacity-60 mt-1.5 text-right tracking-wider">
                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-50 text-black px-4 py-3 border border-neutral-200 rounded-none rounded-bl-none">
                                    <div className="flex space-x-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-black p-3 bg-white">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSendMessage(null, q)}
                                    className="bg-neutral-100 hover:bg-neutral-200 text-black text-[10px] px-2 py-1 border border-neutral-200 transition text-left"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="NHẬP CÂU HỎI..."
                                className="flex-1 border border-black bg-white rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black placeholder:text-neutral-400 tracking-wider"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-black hover:bg-neutral-800 text-white px-4 py-2 border border-black rounded-none transition duration-300 disabled:bg-neutral-200 disabled:border-neutral-200 disabled:text-neutral-400 text-xs font-bold"
                            >
                                {loading ? '...' : '→'}
                            </button>
                        </form>
                        <button
                            onClick={handleClearChat}
                            className="w-full mt-2.5 text-[9px] uppercase tracking-widest text-neutral-500 hover:text-black transition duration-200 font-bold"
                        >
                            Xóa cuộc trò chuyện
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
