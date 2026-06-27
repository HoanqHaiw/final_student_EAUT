const Order = require("../models/order.model");
const ExcelJS = require("exceljs");

// OVERVIEW
const getOverview = async () => {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid");

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.finalPrice, 0);
    const averageOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;
    const paidOrdersCount = paidOrders.length;

    const statusCount = {
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0
    };

    orders.forEach((order) => {
        if (statusCount[order.status] !== undefined) {
            statusCount[order.status]++;
        }
    });

    const revenueTrend = [];
    const monthMap = {};
    const now = new Date();

    for (let offset = 5; offset >= 0; offset--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        monthMap[monthKey] = {
            label: monthDate.toLocaleString('vi-VN', { month: 'short', year: '2-digit' }),
            revenue: 0
        };
    }

    paidOrders.forEach((order) => {
        const createdAt = new Date(order.createdAt);
        const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap[monthKey]) {
            monthMap[monthKey].revenue += order.finalPrice;
        }
    });

    for (const key of Object.keys(monthMap)) {
        revenueTrend.push(monthMap[key]);
    }

    return {
        totalOrders,
        paidOrdersCount,
        totalRevenue,
        averageOrderValue,
        statusCount,
        revenueTrend
    };
};

// TOP PRODUCTS (theo số lượng bán)
const getTopProducts = async () => {
    return await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                name: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);
};

// EXPORT ORDERS TO EXCEL
const exportOrdersExcel = async () => {
    const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
        { header: "Order ID", key: "id", width: 28 },
        { header: "Khách hàng", key: "userName", width: 20 },
        { header: "Email", key: "userEmail", width: 25 },
        { header: "Tổng tiền (VND)", key: "totalPrice", width: 18 },
        { header: "Giảm giá", key: "discount", width: 12 },
        { header: "Thực trả", key: "finalPrice", width: 18 },
        { header: "Coupon", key: "coupon", width: 14 },
        { header: "Trạng thái", key: "status", width: 15 },
        { header: "Thanh toán", key: "paymentStatus", width: 14 },
        { header: "Địa chỉ", key: "shippingAddress", width: 30 },
        { header: "Ngày đặt", key: "createdAt", width: 20 }
    ];

    // style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF111111" }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    orders.forEach((order) => {
        worksheet.addRow({
            id: order._id.toString(),
            userName: order.user?.name || "N/A",
            userEmail: order.user?.email || "N/A",
            totalPrice: order.totalPrice,
            discount: order.discount,
            finalPrice: order.finalPrice,
            coupon: order.coupon || "",
            status: order.status,
            paymentStatus: order.paymentStatus,
            shippingAddress: order.shippingAddress,
            createdAt: new Date(order.createdAt).toLocaleString("vi-VN")
        });
    });

    return workbook;
};

const exportRevenueExcel = async ({ month, year } = {}) => {
    // Build date filter
    let dateFilter = {};
    let reportLabel = 'Tất cả';
    if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        dateFilter = { createdAt: { $gte: start, $lte: end } };
        reportLabel = `Tháng ${String(month).padStart(2, '0')}/${year}`;
    } else if (year) {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        dateFilter = { createdAt: { $gte: start, $lte: end } };
        reportLabel = `Năm ${year}`;
    }

    const orders = await Order.find(dateFilter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalPrice || 0), 0);
    const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin Dashboard';
    workbook.created = new Date();

    // ===== SHEET 1: TỔNG QUAN =====
    const summarySheet = workbook.addWorksheet('📊 Tổng Quan');
    summarySheet.columns = [
        { header: 'Chỉ số', key: 'label', width: 35 },
        { header: 'Giá trị', key: 'value', width: 25 },
    ];
    const hdrRow1 = summarySheet.getRow(1);
    hdrRow1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    hdrRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    hdrRow1.height = 22;

    const statusMap = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã huỷ' };
    const statusCount = {};
    orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

    const summaryData = [
        { label: '📅 Kỳ báo cáo', value: reportLabel },
        { label: '📦 Tổng số đơn hàng', value: orders.length },
        { label: '✅ Đơn đã thanh toán', value: paidOrders.length },
        { label: '💰 Tổng doanh thu (VND)', value: totalRevenue },
        { label: '📈 Giá trị trung bình / đơn (VND)', value: avgOrderValue },
        { label: '' , value: '' },
        { label: '--- Phân loại trạng thái ---', value: '' },
        ...Object.entries(statusCount).map(([s, c]) => ({ label: `   ${statusMap[s] || s}`, value: c })),
    ];
    summaryData.forEach((row, i) => {
        const r = summarySheet.addRow(row);
        if (i === 6) { r.font = { bold: true, color: { argb: 'FF64748B' } }; }
        if (row.label.includes('Tổng doanh thu') || row.label.includes('trung bình')) {
            r.getCell('value').numFmt = '#,##0 "₫"';
            r.font = { bold: true, color: { argb: 'FF16A34A' } };
        }
    });

    // ===== SHEET 2: DANH SÁCH ĐƠN HÀNG =====
    const ordersSheet = workbook.addWorksheet('📋 Danh Sách Đơn Hàng');
    ordersSheet.columns = [
        { header: 'Mã đơn hàng', key: 'id', width: 28 },
        { header: 'Thời gian đặt', key: 'createdAt', width: 22 },
        { header: 'Khách hàng', key: 'customerName', width: 22 },
        { header: 'Email', key: 'customerEmail', width: 28 },
        { header: 'SĐT', key: 'phone', width: 16 },
        { header: 'Địa chỉ giao hàng', key: 'shippingAddress', width: 40 },
        { header: 'Sản phẩm (tóm tắt)', key: 'items', width: 55 },
        { header: 'Tổng tiền hàng (VND)', key: 'totalPrice', width: 20 },
        { header: 'Giảm giá (VND)', key: 'discount', width: 16 },
        { header: 'Phí ship (VND)', key: 'shippingFee', width: 16 },
        { header: 'Thực trả (VND)', key: 'finalPrice', width: 18 },
        { header: 'Mã coupon', key: 'coupon', width: 16 },
        { header: 'Phương thức TT', key: 'paymentMethod', width: 18 },
        { header: 'Trạng thái TT', key: 'paymentStatus', width: 18 },
        { header: 'Trạng thái đơn', key: 'status', width: 18 },
    ];
    const hdrRow2 = ordersSheet.getRow(1);
    hdrRow2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    hdrRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    hdrRow2.height = 22;
    hdrRow2.alignment = { vertical: 'middle', horizontal: 'center' };

    orders.forEach((order, idx) => {
        const itemSummary = (order.items || []).map(item =>
            `${item.name} [${item.size || '-'}/${item.color || '-'}] x${item.quantity} (${(item.price || 0).toLocaleString('vi-VN')}₫)`
        ).join(' | ');

        const addr = order.shippingAddress;
        const fullAddress = typeof addr === 'string' ? addr
            : addr ? `${addr.fullName || ''} - ${addr.phone || ''}, ${addr.address || ''}, ${addr.city || ''}`.trim() : '';

        const row = ordersSheet.addRow({
            id: order._id.toString(),
            createdAt: new Date(order.createdAt).toLocaleString('vi-VN'),
            customerName: order.user?.name || (addr?.fullName || 'Khách'),
            customerEmail: order.user?.email || '',
            phone: order.user?.phone || addr?.phone || '',
            shippingAddress: fullAddress,
            items: itemSummary,
            totalPrice: order.totalPrice || 0,
            discount: order.discount || 0,
            shippingFee: order.shippingFee || 0,
            finalPrice: order.finalPrice || 0,
            coupon: order.coupon || '',
            paymentMethod: order.paymentMethod || '',
            paymentStatus: order.paymentStatus || '',
            status: statusMap[order.status] || order.status || '',
        });

        // Zebra striping
        if (idx % 2 === 1) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
        // Format currency columns
        ['totalPrice', 'discount', 'shippingFee', 'finalPrice'].forEach(key => {
            row.getCell(key).numFmt = '#,##0 "₫"';
        });
        // Color paid status
        const psCell = row.getCell('paymentStatus');
        if (order.paymentStatus === 'paid') psCell.font = { color: { argb: 'FF16A34A' }, bold: true };
        else if (order.paymentStatus === 'unpaid') psCell.font = { color: { argb: 'FFDC2626' } };

        row.alignment = { vertical: 'middle', wrapText: false };
    });

    // ===== SHEET 3: CHI TIẾT TỪNG SẢN PHẨM =====
    const itemsSheet = workbook.addWorksheet('🛒 Chi Tiết Sản Phẩm');
    itemsSheet.columns = [
        { header: 'Mã đơn hàng', key: 'orderId', width: 28 },
        { header: 'Thời gian đặt', key: 'createdAt', width: 22 },
        { header: 'Khách hàng', key: 'customerName', width: 22 },
        { header: 'Email', key: 'customerEmail', width: 28 },
        { header: 'Tên sản phẩm', key: 'productName', width: 35 },
        { header: 'Màu sắc', key: 'color', width: 14 },
        { header: 'Size', key: 'size', width: 10 },
        { header: 'Số lượng', key: 'quantity', width: 12 },
        { header: 'Đơn giá (VND)', key: 'unitPrice', width: 18 },
        { header: 'Thành tiền (VND)', key: 'lineTotal', width: 18 },
        { header: 'Trạng thái đơn', key: 'status', width: 18 },
        { header: 'Trạng thái TT', key: 'paymentStatus', width: 18 },
    ];
    const hdrRow3 = itemsSheet.getRow(1);
    hdrRow3.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    hdrRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
    hdrRow3.height = 22;

    let itemRowIdx = 0;
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const unitPrice = item.price || 0;
            const lineTotal = unitPrice * (item.quantity || 1);
            const row = itemsSheet.addRow({
                orderId: order._id.toString(),
                createdAt: new Date(order.createdAt).toLocaleString('vi-VN'),
                customerName: order.user?.name || order.shippingAddress?.fullName || 'Khách',
                customerEmail: order.user?.email || '',
                productName: item.name || '',
                color: item.color || '-',
                size: item.size || '-',
                quantity: item.quantity || 1,
                unitPrice,
                lineTotal,
                status: statusMap[order.status] || order.status,
                paymentStatus: order.paymentStatus,
            });
            if (itemRowIdx % 2 === 1) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
            }
            row.getCell('unitPrice').numFmt = '#,##0 "₫"';
            row.getCell('lineTotal').numFmt = '#,##0 "₫"';
            if (order.paymentStatus === 'paid') row.getCell('paymentStatus').font = { color: { argb: 'FF16A34A' }, bold: true };
            itemRowIdx++;
        });
    });

    return workbook;
};

module.exports = { getOverview, getTopProducts, exportOrdersExcel, exportRevenueExcel };