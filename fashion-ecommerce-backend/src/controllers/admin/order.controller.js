const orderService = require("../../services/order.service");
const ExcelJS = require("exceljs");

// LIST
const getOrdersAdmin = async (req, res) => {
    const data = await orderService.getOrdersAdmin(req.query);
    res.json(data);
};

// DETAIL
const getOrderDetail = async (req, res) => {
    try {
        const order = await orderService.getOrderDetail(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// UPDATE STATUS
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    if (req.user.role === "staff") {
        const allowedStaffStatuses = ["confirmed", "shipping", "delivered"];
        if (!allowedStaffStatuses.includes(status)) {
            return res.status(403).json({ success: false, message: "Staff can only update shipping statuses" });
        }
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
    const order = await orderService.updatePaymentStatus(
        req.params.id,
        req.body.paymentStatus
    );
    res.json(order);
};

// UPDATE SHIPPING INFO
const updateShippingInfo = async (req, res) => {
    const order = await orderService.updateShippingInfo(req.params.id, {
        shippingMethod: req.body.shippingMethod,
        trackingNumber: req.body.trackingNumber
    });
    res.json(order);
};

// UPDATE RETURN STATUS
const updateReturnStatus = async (req, res) => {
    const order = await orderService.updateReturnStatus(
        req.params.id,
        req.body.returnStatus,
        req.body.returnReason
    );
    res.json(order);
};

// EXPORT EXCEL
const exportOrders = async (req, res) => {
    const { orders } = await orderService.getOrdersAdmin(req.query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    sheet.columns = [
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
        { header: "Shipping Method", key: "shippingMethod", width: 18 },
        { header: "Tracking Number", key: "trackingNumber", width: 22 },
        { header: "Return Status", key: "returnStatus", width: 18 },
        { header: "Return Reason", key: "returnReason", width: 30 },
        { header: "Địa chỉ giao hàng", key: "shippingAddress", width: 40 },
        { header: "Sản phẩm", key: "items", width: 50 },
        { header: "Ngày tạo", key: "createdAt", width: 22 }
    ];

    orders.forEach((order) => {
        const itemDetails = order.items?.map((item) =>
            `${item.name} [${item.size || 'N/A'}/${item.color || 'N/A'}] x${item.quantity}`
        ).join('; ');

        sheet.addRow({
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
            shippingMethod: order.shippingMethod,
            trackingNumber: order.trackingNumber || '',
            returnStatus: order.returnStatus,
            returnReason: order.returnReason || '',
            shippingAddress: order.shippingAddress,
            items: itemDetails,
            createdAt: new Date(order.createdAt).toLocaleString('vi-VN')
        });
    });

    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    getOrdersAdmin,
    getOrderDetail,
    updateOrderStatus,
    updatePaymentStatus,
    updateShippingInfo,
    updateReturnStatus,
    exportOrders
};