export default function Contact() {
    return (
        <div className="container-custom py-16">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-bold mb-6">Liên hệ</h1>
                <p className="text-gray-600 mb-4">
                    Nếu bạn có câu hỏi, cần hỗ trợ đơn hàng hoặc muốn hợp tác, hãy liên hệ với chúng tôi qua thông tin bên dưới.
                </p>
                <div className="space-y-4 text-gray-600">
                    <p><strong>Địa chỉ:</strong> Số 322 Mai Anh Tuấn, Đống Đa, Hà Nội</p>
                    <p><strong>Điện thoại:</strong> <a href="tel:+84365001420" className="text-black hover:underline">(+84) 365 001 420</a></p>
                    <p><strong>Email:</strong> <a href="mailto:lonelystonie420@gmail.com" className="text-black hover:underline">lonelystonie420@gmail.com</a></p>
                    <p><strong>Giờ làm việc:</strong> 9:00 - 18:00 (Thứ Hai - Thứ Bảy)</p>
                </div>
            </div>
        </div>
    );
}
