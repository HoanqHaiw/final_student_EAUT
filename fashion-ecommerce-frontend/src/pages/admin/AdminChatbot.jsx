import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminService } from '../../services/adminService';

const adminQuestionsPool = [
    'Sản phẩm nào bán chạy nhất?',
    'Có mã giảm giá nào đang hoạt động?',
    'Tóm tắt doanh thu hôm nay',
    'Có bao nhiêu đơn hàng đang chờ xử lý?',
    'Tổng số người dùng hiện tại là bao nhiêu?',
    'Sản phẩm nào sắp hết hàng?',
    'Báo cáo doanh thu tháng này',
    'Lấy đơn hàng mới nhất cần xử lý',
    'Liệt kê danh mục sản phẩm',
    'Tìm đơn hàng gần nhất'
];

const staffQuestionsPool = [
    'Có đơn hàng nào đang chờ xử lý không?',
    'Sản phẩm nào sắp hết hàng?',
    'Tìm đơn hàng mới nhất',
    'Kiểm tra kho hàng áo thun',
    'Lấy danh sách sản phẩm tồn kho thấp',
    'Đơn hàng nào vừa được đặt?',
    'Sản phẩm nào cần nhập thêm?'
];

const getRandomQuestions = (pool, count, exclude = []) => {
    const available = pool.filter(q => !exclude.includes(q));
    const finalPool = available.length >= count ? available : pool.filter(q => q !== exclude[0]);
    const shuffled = [...finalPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export default function AdminChatbot() {
    const { user } = useSelector((state) => state.adminAuth);
    const initialBotText = user?.role === 'staff'
        ? 'Xin chào Staff! Tôi là trợ lý AI dành cho nhân viên. Tôi có thể giúp bạn xử lý đơn hàng và kho.'
        : 'Xin chào Admin! Tôi là trợ lý AI dành cho quản trị. Tôi có thể giúp bạn theo dõi đơn hàng, sản phẩm, coupon, danh mục hoặc đưa ra đề xuất cải thiện.';

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: initialBotText,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const pool = user?.role === 'staff' ? staffQuestionsPool : adminQuestionsPool;
        setSuggestedQuestions(getRandomQuestions(pool, 3));
    }, [user?.role]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e, directText = null) => {
        if (e) e.preventDefault();
        const textToSend = typeof directText === 'string' ? directText : inputValue;
        if (!textToSend.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        if (typeof directText !== 'string') setInputValue('');
        setLoading(true);
        setError('');

        const pool = user?.role === 'staff' ? staffQuestionsPool : adminQuestionsPool;
        setSuggestedQuestions(getRandomQuestions(pool, 3, [textToSend, ...suggestedQuestions]));

        try {
            const response = await adminService.askChatbot(textToSend);
            const replyData = response.data.reply;
            const botText = typeof replyData === 'string'
                ? replyData
                : replyData?.text || 'Xin lỗi, trợ lý không thể trả lời lúc này.';
            const botProducts = typeof replyData === 'object' && Array.isArray(replyData?.products)
                ? replyData.products
                : [];

            const botMessage = {
                id: userMessage.id + 1,
                sender: 'bot',
                text: botText,
                products: botProducts,
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Lỗi kết nối tới chatbot.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-4">Trợ lý AI cho {user?.role === 'staff' ? 'Staff' : 'Admin'}</h1>
            <p className="text-sm text-gray-500 mb-6">
                {user?.role === 'staff'
                    ? 'Hỏi trợ lý về đơn hàng, kho, tình trạng vận chuyển và các nghiệp vụ hỗ trợ nhân viên.'
                    : 'Hỏi trợ lý về đơn hàng, sản phẩm, coupon, danh mục, người dùng hoặc báo cáo.'}
            </p>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`rounded-xl p-4 ${msg.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-100 text-gray-900'} ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'} max-w-xl`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.products?.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {msg.products.map((product) => (
                                    <a
                                        key={product.id}
                                        href={product.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-blue-600 underline"
                                    >
                                        {product.name} - {product.priceText}
                                    </a>
                                ))}
                            </div>
                        )}
                        <p className="mt-2 text-xs opacity-70 text-right">
                            {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
                {suggestedQuestions.map((q, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(null, q)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-1.5 px-3 rounded-full transition"
                    >
                        {q}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-3">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập câu hỏi cho trợ lý AI..."
                    className="flex-1 rounded border border-gray-300 px-4 py-3"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
            </form>
        </div>
    );
}
