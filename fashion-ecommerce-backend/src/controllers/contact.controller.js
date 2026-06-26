const Contact = require("../models/contact.model");

// Gửi góp ý (Public)
const createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên, email và lời nhắn" });
        }
        
        const contact = await Contact.create({ name, email, phone, message });
        res.status(201).json({ message: "Cảm ơn bạn đã góp ý. Chúng tôi sẽ phản hồi sớm nhất!", contact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Lấy danh sách góp ý
const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Cập nhật trạng thái góp ý
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const contact = await Contact.findById(id);
        if (!contact) return res.status(404).json({ message: "Không tìm thấy góp ý" });
        
        contact.status = status;
        await contact.save();
        res.json({ message: "Cập nhật trạng thái thành công", contact });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Xóa góp ý
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndDelete(id);
        res.json({ message: "Đã xóa góp ý" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createContact, getContacts, updateContactStatus, deleteContact };
