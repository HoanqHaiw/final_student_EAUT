const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Gửi email xác thực tài khoản
 */
const sendVerifyEmail = async (toEmail, code) => {
    await transporter.sendMail({
        from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Xác thực tài khoản của bạn",
        html: `
            <h2>Chào mừng bạn đến với Fashion Store!</h2>
            <p>Mã xác nhận của bạn là: <strong style="font-size:24px;color:#000;">${code}</strong></p>
            <p>Mã này sẽ hết hạn sau 30 phút.</p>
            <p>Vui lòng nhập mã vào trang xác nhận để hoàn tất đăng ký.</p>
        `
    });
};

/**
 * Gửi email xác nhận đơn hàng
 */
const sendOrderConfirmationEmail = async (toEmail, order) => {
    const itemRows = order.items.map((item) => {
        return `
            <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:12px 0;">${item.name} (${item.size || 'N/A'} / ${item.color || 'N/A'})</td>
                <td style="padding:12px 0;text-align:right;">${item.quantity} x ${item.price.toLocaleString('vi-VN')} ₫</td>
            </tr>`;
    }).join('');

    const discountLine = order.discount > 0 ? `<p><strong>Giảm giá:</strong> -${order.discount.toLocaleString('vi-VN')} ₫</p>` : '';
    const couponLine = order.coupon ? `<p><strong>Mã coupon:</strong> ${order.coupon}</p>` : '';

    await transporter.sendMail({
        from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Xác nhận đơn hàng #${order._id}`,
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.6;">
                <h2>Đơn hàng của bạn đã được ${order.paymentStatus === 'paid' ? 'xác nhận' : 'tiếp nhận'}!</h2>
                <p>Xin chào ${order.user?.name || ''},</p>
                <p>Đơn hàng <strong>#${order._id}</strong> đã được tạo thành công với trạng thái <strong>${order.status}</strong>.</p>
                <h3>Chi tiết đơn hàng:</h3>
                <table width="100%" style="border-collapse:collapse;">
                    ${itemRows}
                </table>
                <p style="margin-top:16px;"><strong>Tạm tính:</strong> ${order.totalPrice.toLocaleString('vi-VN')} ₫</p>
                ${discountLine}
                ${couponLine}
                <p><strong>Phí vận chuyển:</strong> ${order.shippingFee.toLocaleString('vi-VN')} ₫</p>
                <p><strong>Tổng thanh toán:</strong> ${order.finalPrice.toLocaleString('vi-VN')} ₫</p>
                <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'stripe' ? 'Thẻ online' : 'Chuyển khoản ngân hàng'}</p>
                <h3>Địa chỉ giao hàng:</h3>
                <p>${order.shippingAddress}</p>
                <p>Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
                <p>Chúc bạn một ngày tốt lành,</p>
                <p><strong>Fashion Store</strong></p>
            </div>
        `
    });
};

/**
 * Gửi email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (toEmail, token) => {
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Đặt lại mật khẩu",
        html: `
            <h2>Yêu cầu đặt lại mật khẩu</h2>
            <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
            <a href="${url}" style="
                display:inline-block;
                padding:12px 24px;
                background:#111;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
            ">Đặt lại mật khẩu</a>
            <p style="margin-top:16px;color:#666;">Link hết hạn sau 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        `
    });
};

module.exports = { sendVerifyEmail, sendResetPasswordEmail, sendOrderConfirmationEmail };