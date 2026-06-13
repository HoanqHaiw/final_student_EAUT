import { Link } from 'react-router-dom';

export default function FAQ() {
    return (
        <div className="container-custom py-16">
            <h1 className="text-3xl font-bold mb-6">Câu hỏi thường gặp (FAQ)</h1>
            <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Làm sao để đặt hàng?</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Chọn sản phẩm yêu thích, thêm vào giỏ hàng, sau đó vào trang Thanh toán để điền thông tin giao hàng và hoàn tất đơn hàng.
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Thời gian giao hàng là bao lâu?</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Thông thường đơn hàng sẽ được chuẩn bị và giao đến trong 3-5 ngày làm việc, tùy vào địa chỉ nhận hàng.
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Làm thế nào nếu muốn đổi trả?</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Bạn có thể truy cập trang <Link to="/return" className="text-black font-semibold hover:underline">Chính sách đổi trả</Link> để xem hướng dẫn và điều kiện đổi trả.
                    </p>
                </div>
            </div>
        </div>
    );
}
