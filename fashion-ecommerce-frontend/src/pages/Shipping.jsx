export default function Shipping() {
    return (
        <div className="container-custom py-16">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-bold mb-6">Thông tin giao hàng</h1>
                <p className="text-gray-600 mb-4">
                    Chúng tôi cung cấp giao hàng toàn quốc với phí vận chuyển miễn phí cho mọi đơn hàng. Thời gian giao hàng thường từ 3-5 ngày làm việc tùy vào khu vực.
                </p>
                <div className="space-y-4 text-gray-600">
                    <p><strong>Phương thức vận chuyển:</strong> Giao hàng tiêu chuẩn.</p>
                    <p><strong>Thời gian xử lý:</strong> 24-48 giờ để xử lý đơn hàng sau khi xác nhận thanh toán.</p>
                    <p><strong>Địa điểm giao hàng:</strong> Toàn quốc.</p>
                    <p><strong>Theo dõi đơn hàng:</strong> Bạn sẽ nhận được email xác nhận khi đơn hàng được gửi đi.</p>
                </div>
            </div>
        </div>
    );
}
