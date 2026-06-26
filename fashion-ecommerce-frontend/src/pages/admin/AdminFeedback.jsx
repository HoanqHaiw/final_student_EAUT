import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Mail, CheckCircle, Trash2, Clock } from 'lucide-react';

export default function AdminFeedback() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchContacts = async () => {
        try {
            const res = await adminService.getContacts();
            setContacts(res.data);
        } catch (err) {
            setError('Lỗi tải danh sách góp ý');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await adminService.updateContactStatus(id, status);
            fetchContacts();
        } catch (err) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    const deleteContact = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;
        try {
            await adminService.deleteContact(id);
            fetchContacts();
        } catch (err) {
            alert('Lỗi xóa góp ý');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-500" />
                Góp ý người dùng
            </h1>

            {contacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    Chưa có góp ý nào từ người dùng
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact) => (
                        <div key={contact._id} className={`p-5 rounded-xl border transition-all ${contact.status === 'new' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg">{contact.name}</h3>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                                            contact.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                                            contact.status === 'read' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {contact.status === 'new' ? <span className="w-2 h-2 rounded-full bg-blue-500"></span> : null}
                                            {contact.status === 'new' ? 'Mới' : contact.status === 'read' ? 'Đã đọc' : 'Đã xử lý'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3 flex gap-4">
                                        <span>📧 <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600">{contact.email}</a></span>
                                        {contact.phone && <span>📞 {contact.phone}</span>}
                                        <span className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(contact.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="bg-white p-4 rounded border border-gray-100 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                        {contact.message}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    {contact.status === 'new' && (
                                        <button 
                                            onClick={() => updateStatus(contact._id, 'read')}
                                            className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 transition"
                                        >
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                    {contact.status !== 'resolved' && (
                                        <button 
                                            onClick={() => updateStatus(contact._id, 'resolved')}
                                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle className="w-3 h-3" /> Xong
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteContact(contact._id)}
                                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition flex items-center justify-center gap-1 mt-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
