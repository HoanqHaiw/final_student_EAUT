import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { orderAPI } from '../services/authService';

pdfMake.vfs = pdfFonts;

const statusSteps = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'delivered', label: 'Đã giao' }
];

const formatCurrency = (value) => value.toLocaleString('vi-VN') + ' ₫';

const extractProvince = (address) => {
    if (!address) return 'Hà Nội';
    const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length === 0) return 'Hà Nội';
    return parts[parts.length - 1];
};

const getShipmentInfo = (order) => {
    const destination = extractProvince(order.shippingAddress);
    let currentLocation = 'Kho shop Hà Nội';
    let currentNote = 'Đơn đang được xử lý và chuẩn bị gửi tới đơn vị vận chuyển.';

    if (order.status === 'pending') {
        currentLocation = 'Shop Hà Nội';
        currentNote = 'Đơn chưa được xác nhận. Shop đang chờ xử lý.';
    } else if (order.status === 'confirmed') {
        currentLocation = 'Kho hàng Hà Nội';
        currentNote = 'Đơn đã được xác nhận và chuẩn bị hàng.';
    } else if (order.status === 'shipping') {
        currentLocation = destination === 'Hải Phòng' ? 'Hải Dương' : `Trên đường đến ${destination}`;
        currentNote = `Đơn đang vận chuyển đến ${destination}.`;
    } else if (order.status === 'delivered') {
        currentLocation = destination;
        currentNote = `Đơn đã được giao tại ${destination}.`;
    } else if (order.status === 'cancelled') {
        currentLocation = 'Đơn đã huỷ';
        currentNote = 'Đơn hàng đã bị huỷ và không còn vận chuyển.';
    }

    const currentStatusIndex = statusSteps.findIndex((step) => step.key === order.status);
    const trackingEvents = statusSteps.map((step, index) => ({
        ...step,
        completed: index <= currentStatusIndex,
        description:
            step.key === 'pending'
                ? 'Shop đang chờ xác nhận đơn hàng.'
                : step.key === 'confirmed'
                    ? 'Đơn hàng đã được xác nhận và chuẩn bị giao.'
                    : step.key === 'shipping'
                        ? `Đơn đang trên đường tới ${destination}.`
                        : `Đơn đã giao tại ${destination}.`
    }));

    return { destination, currentLocation, currentNote, trackingEvents, currentStatusIndex };
};

const generateInvoicePdf = (order) => {
    const destination = extractProvince(order.shippingAddress);
    const rows = order.items.map((item, index) => [
        { text: `${index + 1}`, alignment: 'center' },
        item.name,
        'Chiếc',
        { text: `${item.quantity}`, alignment: 'center' },
        { text: formatCurrency(item.price), alignment: 'right' },
        { text: formatCurrency(item.price * item.quantity), alignment: 'right' }
    ]);

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: {
            fontSize: 10
        },
        content: [
            { text: 'HÓA ĐƠN BÁN HÀNG', style: 'header' },
            { text: 'HOÁ ĐƠN ĐIỆN TỬ', style: 'subheader' },
            { text: '\n' },
            {
                columns: [
                    [
                        { text: 'Người bán:', style: 'fieldLabel' },
                        { text: 'Công ty TNHH Fake Fashion', margin: [0, 3, 0, 0] },
                        { text: 'MST: 0101234567', margin: [0, 2, 0, 0] },
                        { text: 'Địa chỉ: Số 1, Phố Lê Lai, Quận Hoàn Kiếm, Hà Nội', margin: [0, 2, 0, 0] },
                        { text: 'Điện thoại: 032 123 4567', margin: [0, 2, 0, 0] }
                    ],
                    [
                        { text: 'Người mua:', style: 'fieldLabel' },
                        { text: order.user?.name || 'Khách hàng', margin: [0, 3, 0, 0] },
                        { text: `Email: ${order.user?.email || '-'}`, margin: [0, 2, 0, 0] },
                        { text: `SĐT: ${order.phone || order.user?.phone || '-'}`, margin: [0, 2, 0, 0] },
                        { text: `Địa chỉ: ${order.shippingAddress}`, margin: [0, 2, 0, 0] }
                    ]
                ]
            },
            { text: '\n' },
            {
                columns: [
                    [
                        { text: `Số hóa đơn: ${order._id}`, style: 'invoiceMeta' },
                        { text: `Ngày: ${new Date(order.createdAt).toLocaleString('vi-VN')}`, style: 'invoiceMeta' }
                    ],
                    [
                        { text: `Trạng thái: ${order.status}`, style: 'invoiceMeta', alignment: 'right' },
                        { text: `Thanh toán: ${order.paymentStatus}`, style: 'invoiceMeta', alignment: 'right' }
                    ]
                ]
            },
            { text: '\n' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'STT', style: 'tableHeader', alignment: 'center' },
                            { text: 'Tên hàng', style: 'tableHeader' },
                            { text: 'ĐVT', style: 'tableHeader', alignment: 'center' },
                            { text: 'Số lượng', style: 'tableHeader', alignment: 'center' },
                            { text: 'Đơn giá', style: 'tableHeader', alignment: 'right' },
                            { text: 'Thành tiền', style: 'tableHeader', alignment: 'right' }
                        ],
                        ...rows
                    ]
                }
            },
            { text: '\n' },
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                ['Tổng hàng:', formatCurrency(order.totalPrice)],
                                ['Giảm giá:', formatCurrency(order.discount || 0)],
                                ['Phí ship:', formatCurrency(order.shippingFee)],
                                ['Tổng thanh toán:', formatCurrency(order.finalPrice)]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            },
            { text: '\n' },
            { text: 'Thông tin vận chuyển', style: 'sectionTitle' },
            { text: `Địa điểm hiện tại: ${destination}`, margin: [0, 2, 0, 0] },
            { text: `Hình thức thanh toán: ${order.paymentMethod.toUpperCase()}`, margin: [0, 2, 0, 0] },
            { text: '\n' },
            { text: 'Người lập hóa đơn', style: 'signTitle' },
            { text: '\n\n\n' },
            { text: 'Ký tên và đóng dấu', style: 'signText' }
        ],
        styles: {
            header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
            subheader: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            fieldLabel: { bold: true, fontSize: 11 },
            invoiceMeta: { fontSize: 10, margin: [0, 2, 0, 0] },
            tableHeader: { bold: true, fillColor: '#eeeeee', fontSize: 10 },
            sectionTitle: { bold: true, fontSize: 12, margin: [0, 8, 0, 4] },
            signTitle: { bold: true, fontSize: 11, margin: [0, 20, 0, 0] },
            signText: { italics: true, fontSize: 10, margin: [0, 5, 0, 0] }
        }
    };

    pdfMake.createPdf(docDefinition).download(`invoice_${order._id}.pdf`);
};

const generateInvoiceText = (order) => {
    const lines = [];
    lines.push('HOÁ ĐƠN ĐIỆN TỬ');
    lines.push('==============================');
    lines.push(`Mã đơn hàng: ${order._id}`);
    lines.push(`Ngày đặt: ${new Date(order.createdAt).toLocaleString('vi-VN')}`);
    lines.push(`Trạng thái: ${order.status}`);
    lines.push(`Thanh toán: ${order.paymentStatus}`);
    lines.push('');
    lines.push('Thông tin khách hàng:');
    lines.push(`- Email: ${order.user?.email || ''}`);
    lines.push(`- Tên: ${order.user?.name || ''}`);
    lines.push(`- Số điện thoại: ${order.phone || order.user?.phone || ''}`);
    lines.push('');
    lines.push('Địa chỉ giao hàng:');
    lines.push(order.shippingAddress || '');
    lines.push('');
    lines.push('Sản phẩm:');

    order.items.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name} - Size: ${item.size} - Màu: ${item.color}`);
        lines.push(`   Số lượng: ${item.quantity} x ${item.price.toLocaleString('vi-VN')} ₫ = ${(
            item.price * item.quantity
        ).toLocaleString('vi-VN')} ₫`);
    });

    lines.push('');
    lines.push(`Tổng hàng: ${formatCurrency(order.totalPrice)}`);
    lines.push(`Giảm giá: ${formatCurrency(order.discount)}`);
    lines.push(`Phí ship: ${formatCurrency(order.shippingFee)}`);
    lines.push(`Tổng thanh toán: ${formatCurrency(order.finalPrice)}`);
    return lines.join('\n');
};

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrder = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await orderAPI.getById(id);
                setOrder(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không tìm thấy đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    const handleDownloadInvoice = () => {
        if (!order) return;
        generateInvoicePdf(order);
    };

    const isInvoiceAvailable = order && order.status === 'delivered';

    const { currentLocation, currentNote, trackingEvents, currentStatusIndex } = order
        ? getShipmentInfo(order)
        : { currentLocation: '', currentNote: '', trackingEvents: [], currentStatusIndex: 0 };

    return (
        <div className="container-custom py-16">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-black transition hover:border-black hover:text-black"
            >
                Quay lại
            </button>

            {loading && <div className="text-gray-600">Đang tải thông tin đơn hàng...</div>}
            {error && <div className="rounded bg-red-100 px-4 py-3 text-red-800">{error}</div>}

            {order && (
                <div className="space-y-8">
                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                <h1 className="text-2xl font-bold text-black">{order._id}</h1>
                                <p className="mt-2 text-sm text-gray-500">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">{order.status.toUpperCase()}</span>
                                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">{order.paymentStatus.toUpperCase()}</span>
                            </div>
                        </div>

                        {order.status === 'confirmed' && (
                            <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6">
                                <p className="text-lg font-semibold text-green-900">Đơn hàng đã được xác nhận thành công!</p>
                                <p className="mt-2 text-sm text-green-800">Admin đã xác nhận đơn hàng. Cảm ơn bạn, đơn hàng của bạn đang được xử lý tiếp theo.</p>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
                                    >
                                        Về trang chủ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/orders')}
                                        className="rounded-full border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
                                    >
                                        Xem danh sách đơn hàng
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl border border-gray-200 bg-slate-950 p-5 text-white">
                                <p className="text-sm text-gray-300">Tổng sản phẩm</p>
                                <p className="mt-2 text-xl font-semibold">{order.items.length}</p>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-slate-950 p-5 text-white">
                                <p className="text-sm text-gray-300">Tổng hàng</p>
                                <p className="mt-2 text-xl font-semibold">{formatCurrency(order.totalPrice)}</p>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-slate-950 p-5 text-white">
                                <p className="text-sm text-gray-300">Phí ship</p>
                                <p className="mt-2 text-xl font-semibold">{formatCurrency(order.shippingFee)}</p>
                            </div>
                            <div className="rounded-3xl border border-gray-200 bg-black p-5 text-white">
                                <p className="text-sm text-gray-400">Tổng thanh toán</p>
                                <p className="mt-2 text-2xl font-bold">{formatCurrency(order.finalPrice)}</p>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-black">Thông tin giao hàng</h2>
                                <p className="mt-3 text-sm text-gray-600">{order.shippingAddress}</p>
                                <p className="mt-3 text-sm text-gray-600"><span className="font-semibold text-black">Phương thức thanh toán:</span> {order.paymentMethod.toUpperCase()}</p>
                                <p className="mt-1 text-sm text-gray-600"><span className="font-semibold text-black">Mã giảm giá:</span> {order.coupon || 'Không có'}</p>
                            </div>
                            <div className="rounded-3xl border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-black">Thông tin người đặt</h2>
                                <p className="mt-3 text-sm text-gray-600"><span className="font-semibold text-black">Tên:</span> {order.user?.name || 'Khách hàng'}</p>
                                <p className="mt-1 text-sm text-gray-600"><span className="font-semibold text-black">Email:</span> {order.user?.email}</p>
                                <p className="mt-1 text-sm text-gray-600"><span className="font-semibold text-black">SĐT:</span> {order.phone || order.user?.phone || 'Không có'}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-black">Theo dõi đơn hàng</h2>
                            <div className="mt-4 rounded-3xl border border-gray-200 bg-gray-50 p-5">
                                <p className="text-sm text-gray-600">Vị trí hiện tại:</p>
                                <p className="mt-2 text-lg font-semibold text-black">{currentLocation}</p>
                                <p className="mt-2 text-sm text-gray-500">{currentNote}</p>
                            </div>
                            <div className="mt-5 flex flex-col gap-4">
                                {trackingEvents.map((event, index) => (
                                    <div key={event.key} className="flex items-start gap-4">
                                        <span className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full border-2 ${event.completed ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className={`font-semibold ${event.completed ? 'text-black' : 'text-gray-500'}`}>{event.label}</p>
                                            <p className="text-sm text-gray-500">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={!isInvoiceAvailable}
                                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${isInvoiceAvailable ? 'bg-black text-white hover:bg-gray-800' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}
                            >
                                Xuất hoá đơn điện tử
                            </button>
                            {!isInvoiceAvailable && (
                                <p className="text-sm text-gray-500">Hoá đơn điện tử (VAT) chỉ được phát hành khi đơn hàng đã giao thành công.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-semibold text-black">Chi tiết sản phẩm</h2>
                        <div className="mt-6 space-y-6">
                            {order.items.map((item) => (
                                <div key={`${item._id}-${item.product?._id}`} className="flex flex-col gap-4 rounded-3xl border border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-28 w-28 overflow-hidden rounded-3xl bg-gray-100">
                                            <img
                                                src={item.product?.images?.[0] || '/fallback-image.png'}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-black">{item.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.size} • Màu: {item.color}</p>
                                            <p className="mt-2 text-sm text-gray-500">Đơn giá: {formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="min-w-[160px] rounded-3xl bg-gray-100 px-4 py-3 text-center">
                                        <p className="text-sm text-gray-500">Số lượng</p>
                                        <p className="mt-1 text-lg font-semibold text-black">{item.quantity}</p>
                                    </div>
                                    <div className="min-w-[160px] rounded-3xl bg-slate-950 px-4 py-3 text-center text-white">
                                        <p className="text-sm text-gray-300">Thành tiền</p>
                                        <p className="mt-1 text-lg font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
