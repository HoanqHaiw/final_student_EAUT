require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    try {
        console.log('Đang lấy cấu hình từ .env...');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS có tồn tại không?:', process.env.EMAIL_PASS ? 'Có' : 'Không');
        
        console.log('Đang tiến hành gửi email test...');
        let info = await transporter.sendMail({
            from: `"Fashion Store Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Test Email from Backend",
            text: "Đây là email test để kiểm tra tính hợp lệ của cấu hình Nodemailer."
        });
        console.log("✅ GỬI EMAIL THÀNH CÔNG! MessageId:", info.messageId);
    } catch (error) {
        console.error("❌ LỖI GỬI EMAIL:", error.message);
        console.error("Chi tiết lỗi:", error);
    }
}

testEmail();
