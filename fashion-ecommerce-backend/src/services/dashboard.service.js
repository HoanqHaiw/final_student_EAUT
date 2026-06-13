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

const exportRevenueExcel = async () => {
    const overview = await getOverview();
    const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet("Tổng quan doanh thu");
    summarySheet.columns = [
        { header: "Chỉ số", key: "label", width: 30 },
        { header: "Giá trị", key: "value", width: 30 }
    ];

    summarySheet.addRow({ label: "Tổng đơn hàng", value: overview.totalOrders });
    summarySheet.addRow({ label: "Tổng đơn hàng đã thanh toán", value: overview.paidOrdersCount });
    summarySheet.addRow({ label: "Tổng doanh thu thanh toán (VND)", value: overview.totalRevenue });
    summarySheet.addRow({ label: "Giá trị đơn trung bình (VND)", value: overview.averageOrderValue });
    summarySheet.addRow({ label: "Đơn hàng đang chờ xử lý", value: overview.statusCount.pending });
    summarySheet.addRow({ label: "Đơn hàng đã xác nhận", value: overview.statusCount.confirmed });
    summarySheet.addRow({ label: "Đơn hàng đang giao", value: overview.statusCount.shipping });
    summarySheet.addRow({ label: "Đơn hàng đã giao", value: overview.statusCount.delivered });
    summarySheet.addRow({ label: "Đơn hàng đã huỷ", value: overview.statusCount.cancelled });

    const trendSheet = workbook.addWorksheet("Doanh thu theo tháng");
    trendSheet.columns = [
        { header: "Tháng", key: "label", width: 20 },
        { header: "Doanh thu (VND)", key: "revenue", width: 20 }
    ];

    overview.revenueTrend.forEach((item) => {
        trendSheet.addRow({ label: item.label, revenue: item.revenue });
    });

    const ordersSheet = workbook.addWorksheet("Đơn hàng");
    ordersSheet.columns = [
        { header: "Order ID", key: "id", width: 28 },
        { header: "Khách hàng", key: "customerName", width: 24 },
        { header: "Email", key: "customerEmail", width: 30 },
        { header: "Tổng tiền (VND)", key: "totalPrice", width: 16 },
        { header: "Giảm giá (VND)", key: "discount", width: 14 },
        { header: "Phí ship (VND)", key: "shippingFee", width: 14 },
        { header: "Thực trả (VND)", key: "finalPrice", width: 16 },
        { header: "Coupon", key: "coupon", width: 18 },
        { header: "Phương thức thanh toán", key: "paymentMethod", width: 18 },
        { header: "Trạng thái thanh toán", key: "paymentStatus", width: 16 },
        { header: "Trạng thái đơn", key: "status", width: 16 },
        { header: "Địa chỉ giao hàng", key: "shippingAddress", width: 40 },
        { header: "Sản phẩm", key: "items", width: 50 },
        { header: "Ngày tạo", key: "createdAt", width: 22 }
    ];

    orders.forEach((order) => {
        const itemDetails = order.items?.map((item) =>
            `${item.name} [${item.size || 'N/A'}/${item.color || 'N/A'}] x${item.quantity}`
        ).join('; ');

        ordersSheet.addRow({
            id: order._id.toString(),
            customerName: order.user?.name || '',
            customerEmail: order.user?.email || '',
            totalPrice: order.totalPrice,
            discount: order.discount,
            shippingFee: order.shippingFee,
            finalPrice: order.finalPrice,
            coupon: order.coupon || '',
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            status: order.status,
            shippingAddress: order.shippingAddress,
            items: itemDetails,
            createdAt: new Date(order.createdAt).toLocaleString('vi-VN')
        });
    });

    return workbook;
};

module.exports = { getOverview, getTopProducts, exportOrdersExcel, exportRevenueExcel };