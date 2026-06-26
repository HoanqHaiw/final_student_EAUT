import { useState } from 'react';
import { contactAPI } from '../services/authService';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await contactAPI.send(formData);
            setSuccess(res.data.message || 'Cảm ơn bạn đã gửi góp ý!');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold mb-6">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Chúng tôi luôn lắng nghe và trân trọng mọi ý kiến đóng góp từ bạn. Nếu bạn có bất kỳ câu hỏi, yêu cầu hỗ trợ hoặc muốn hợp tác, xin đừng ngần ngại liên hệ.
                    </p>
                    <div className="space-y-6 text-gray-600">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                                📍
                            </div>
                            <div>
                                <h3 className="font-bold text-black text-lg">Địa chỉ</h3>
                                <p>Số 322 Mai Anh Tuấn, Đống Đa, Hà Nội</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                                📞
                            </div>
                            <div>
                                <h3 className="font-bold text-black text-lg">Điện thoại</h3>
                                <p><a href="tel:+84365001420" className="hover:text-black hover:underline">(+84) 365 001 420</a></p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                                ✉️
                            </div>
                            <div>
                                <h3 className="font-bold text-black text-lg">Email</h3>
                                <p><a href="mailto:lonelystonie420@gmail.com" className="hover:text-black hover:underline">lonelystonie420@gmail.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn</h2>
                    {success && <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-6">{success}</div>}
                    {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Họ tên *</label>
                            <input 
                                type="text" 
                                name="name"
                                required 
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    required 
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="0912345678"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Lời nhắn *</label>
                            <textarea 
                                required
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                placeholder="Bạn cần hỗ trợ gì?"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-70"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi Lời Nhắn'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
