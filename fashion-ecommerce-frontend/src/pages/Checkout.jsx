import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import { logout } from '../redux/slices/authSlice';
import { couponAPI, orderAPI, paymentAPI } from '../services/authService';
import locations from '../data/vietnam-locations.json';

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [bankTransferOrder, setBankTransferOrder] = useState(null);

    const [shipping, setShipping] = useState({
        fullName: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        phone: ''
    });
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const shippingFee = useMemo(() => {
        if (totalPrice >= 1000000) return 0;
        if (!shipping.province) return 0;
        const majorCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
        return majorCities.includes(shipping.province) ? 30000 : 50000;
    }, [totalPrice, shipping.province]);

    const finalTotal = totalPrice - discount + shippingFee;

    const provinceOptions = locations;

    const districtOptions = useMemo(() => {
        const province = locations.find((item) => item.name === shipping.province);
        return province?.districts || [];
    }, [shipping.province]);

    const wardOptions = useMemo(() => {
        const district = districtOptions.find((item) => item.name === shipping.district);
        return district?.wards || [];
    }, [districtOptions, shipping.district]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipping((prev) => {
            if (name === 'province') {
                return { ...prev, province: value, district: '', ward: '' };
            }
            if (name === 'district') {
                return { ...prev, district: value, ward: '' };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleApplyCoupon = async () => {
        setCouponMessage('');
        setError('');
        if (!couponCode.trim()) {
            setCouponMessage('Nhập mã coupon để áp dụng.');
            return;
        }

        try {
            const response = await couponAPI.validate(couponCode.trim(), totalPrice);
            setDiscount(response.data.discount || 0);
            setCouponMessage(`Áp dụng mã thành công. Giảm ${response.data.discount.toLocaleString('vi-VN')} ₫`);
        } catch (err) {
            setDiscount(0);
            setCouponMessage('Mã không hợp lệ hoặc đã hết hạn.');
            setError(err.response?.data?.message || err.message || 'Lỗi khi kiểm tra coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (items.length === 0) {
            setError('Giỏ hàng của bạn đang trống.');
            setLoading(false);
            return;
        }

        if (
            !shipping.fullName ||
            !shipping.province ||
            !shipping.district ||
            !shipping.ward ||
            !shipping.street ||
            !shipping.phone
        ) {
            setError('Vui lòng điền đầy đủ thông tin giao hàng.');
            setLoading(false);
            return;
        }

        try {
            const shippingAddress = `${shipping.street}, ${shipping.ward}, ${shipping.district}, ${shipping.province}, ${shipping.phone}`;
            const response = await orderAPI.create({
                shippingAddress,
                phone: shipping.phone,
                couponCode: couponCode.trim() || undefined,
                paymentMethod,
                cartItems: items.map((item) => ({
                    productId: item.productId,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            const newOrder = response.data.data;
            dispatch(clearCart());

            if (paymentMethod === 'stripe') {
                const paymentResponse = await paymentAPI.checkout(newOrder._id);
                window.location.href = paymentResponse.data.data.url;
                return;
            }

            if (paymentMethod === 'bank_transfer') {
                setBankTransferOrder(newOrder);
                return;
            }

            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đặt hàng thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16 animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
            {items.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    Giỏ hàng của bạn đang trống.
                </div>
            ) : (
                <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Thông tin giao hàng</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Họ và tên</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shipping.fullName}
                                            onChange={handleChange}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shipping.phone}
                                            onChange={handleChange}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Tỉnh / Thành phố</label>
                                        <select
                                            name="province"
                                            value={shipping.province}
                                            onChange={handleChange}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none"
                                            required
                                        >
                                            <option value="">Chọn tỉnh/thành</option>
                                            {provinceOptions.map((province) => (
                                                <option key={province.name} value={province.name}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Quận / Huyện</label>
                                        <select
                                            name="district"
                                            value={shipping.district}
                                            onChange={handleChange}
                                            disabled={!shipping.province}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                            required
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {districtOptions.map((district) => (
                                                <option key={district.name} value={district.name}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Xã / Phường</label>
                                        <select
                                            name="ward"
                                            value={shipping.ward}
                                            onChange={handleChange}
                                            disabled={!shipping.district}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                            required
                                        >
                                            <option value="">Chọn xã/phường</option>
                                            {wardOptions.map((ward) => (
                                                <option key={ward} value={ward}>
                                                    {ward}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Địa chỉ chi tiết</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shipping.street}
                                            onChange={handleChange}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none"
                                            placeholder="Số nhà, ngõ, tên đường"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Phương thức thanh toán</label>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={paymentMethod === 'cod'}
                                                onChange={() => setPaymentMethod('cod')}
                                                className="h-4 w-4 text-black"
                                            />
                                            <span>
                                                Thanh toán khi nhận hàng
                                                <div className="text-xs text-gray-500">COD - thanh toán tại nhà</div>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="stripe"
                                                checked={paymentMethod === 'stripe'}
                                                onChange={() => setPaymentMethod('stripe')}
                                                className="h-4 w-4 text-black"
                                            />
                                            <span>
                                                Thanh toán thẻ online
                                                <div className="text-xs text-gray-500">Stripe Checkout</div>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="bank_transfer"
                                                checked={paymentMethod === 'bank_transfer'}
                                                onChange={() => setPaymentMethod('bank_transfer')}
                                                className="h-4 w-4 text-black"
                                            />
                                            <span>
                                                Chuyển khoản ngân hàng
                                                <div className="text-xs text-gray-500">Hiển thị QR và thông tin chuyển khoản</div>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Mã giảm giá (nếu có)</label>
                                    <div className="flex gap-3 flex-col sm:flex-row">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 transition duration-200 focus:border-black focus:bg-white focus:outline-none"
                                            placeholder="Nhập mã coupon"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            className="rounded bg-black px-4 py-3 text-white hover:bg-gray-800 transition duration-200"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    {couponMessage && <p className="mt-3 text-sm text-green-700">{couponMessage}</p>}
                                </div>
                                {paymentMethod === 'bank_transfer' && (
                                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                                        Quý khách chọn hình thức chuyển khoản. Sau khi đặt hàng, hệ thống sẽ hiển thị QR và thông tin chuyển khoản để quét.
                                    </div>
                                )}
                                {error && <div className="rounded bg-red-100 px-4 py-3 text-red-800">{error}</div>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded bg-black px-4 py-3 text-white hover:bg-gray-800 transition duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý đơn hàng...' : 'Đặt hàng và thanh toán'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <aside className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                        <h2 className="text-2xl font-bold mb-5">Tóm tắt đơn hàng</h2>
                        <div className="space-y-4">
                            {(bankTransferOrder ? bankTransferOrder.items : items).map((item) => (
                                <div key={item._id || item.id} className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
                                    <div>
                                        <p className="font-semibold text-black">{item.name}</p>
                                        <p className="text-sm text-gray-500">Size: {item.size} | Màu: {item.color}</p>
                                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>{(bankTransferOrder ? bankTransferOrder.totalPrice : totalPrice).toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Giảm giá</span>
                                <span>-{(bankTransferOrder ? bankTransferOrder.discount || 0 : discount).toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span>
                                    {bankTransferOrder
                                        ? bankTransferOrder.shippingFee === 0
                                            ? 'Miễn phí'
                                            : `${bankTransferOrder.shippingFee.toLocaleString('vi-VN')} ₫`
                                        : shippingFee === 0
                                            ? totalPrice >= 1000000
                                                ? 'Miễn phí'
                                                : shipping.province
                                                    ? 'Miễn phí'
                                                    : 'Chưa chọn tỉnh'
                                            : `${shippingFee.toLocaleString('vi-VN')} ₫`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Thuế VAT</span>
                                <span>{((bankTransferOrder ? ((bankTransferOrder.totalPrice - (bankTransferOrder.discount || 0) + bankTransferOrder.shippingFee) * 0.1) : (finalTotal * 0.1)) || 0).toLocaleString('vi-VN')} ₫</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between border-t border-gray-200 pt-6 text-xl font-bold">
                            <span>Thành tiền</span>
                            <span>{(bankTransferOrder ? Math.round((bankTransferOrder.totalPrice - (bankTransferOrder.discount || 0) + bankTransferOrder.shippingFee) * 1.1) : Math.round(finalTotal * 1.1)).toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </aside>
                </div>
            )}
            {bankTransferOrder && (
                <div className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-black mb-4">Thông tin chuyển khoản</h2>
                    <p className="text-sm text-gray-700 mb-3">Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới. Sau khi chuyển khoản, shop sẽ xác nhận và cập nhật trạng thái đơn.</p>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-gray-200 bg-white p-6">
                            <p className="text-sm text-gray-500">Số tiền cần chuyển</p>
                            <p className="mt-2 text-3xl font-bold text-black">{Math.round((bankTransferOrder.totalPrice - (bankTransferOrder.discount || 0) + bankTransferOrder.shippingFee) * 1.1).toLocaleString('vi-VN')} ₫</p>
                            <div className="mt-6 space-y-3 text-sm text-gray-600">
                                <div>
                                    <p className="font-semibold text-black">Ngân hàng</p>
                                    <p>Vietcombank</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-black">Chủ tài khoản</p>
                                    <p>CÔNG TY TNHH FAKE FASHION</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-black">Số tài khoản</p>
                                    <p>123456789012</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-black">Nội dung chuyển khoản</p>
                                    <p>TT Đơn hàng {bankTransferOrder._id}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">Quét QR để chuyển khoản nhanh</p>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`Vietcombank|123456789012|CÔNG TY TNHH FAKE FASHION|${Math.round((bankTransferOrder.totalPrice - (bankTransferOrder.discount || 0) + bankTransferOrder.shippingFee) * 1.1)}|TT Đơn hàng ${bankTransferOrder._id}`)}`}
                                alt="QR chuyển khoản"
                                className="mx-auto h-[260px] w-[260px] rounded-2xl border border-gray-200 bg-white p-2"
                            />
                            <p className="mt-4 text-xs text-gray-500">Nếu QR không quét được, bạn có thể dùng thông tin tài khoản phía trên để chuyển khoản.</p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate('/orders')}
                            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            Xem danh sách đơn hàng
                        </button>
                        <button
                            type="button"
                            onClick={() => setBankTransferOrder(null)}
                            className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-100"
                        >
                            Quay lại trang thanh toán
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
