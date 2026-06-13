const Event = require("../../models/event.model");

/**
 * ADMIN EVENT MANAGEMENT ENDPOINTS
 */

// GET all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ startDate: -1 });
        res.json({
            success: true,
            count: events.length,
            events: events
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET event by id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện"
            });
        }
        res.json({
            success: true,
            event: event
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Helper to parse details
const parseDetails = (details) => {
    if (Array.isArray(details)) return details;
    if (typeof details === "string") {
        return details.split("\n").map(d => d.trim()).filter(Boolean);
    }
    return [];
};

// CREATE event
const createEvent = async (req, res) => {
    try {
        const { title, subtitle, description, details, ctaLabel, ctaLink, startDate, endDate } = req.body;
        const newEvent = await Event.create({
            title,
            subtitle: subtitle || "",
            description: description || "",
            details: parseDetails(details),
            ctaLabel: ctaLabel || "Khám phá",
            ctaLink: ctaLink || "/products",
            startDate,
            endDate: endDate || null
        });
        res.status(201).json({
            success: true,
            message: "Tạo sự kiện thành công",
            event: newEvent
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// UPDATE event
const updateEvent = async (req, res) => {
    try {
        const { title, subtitle, description, details, ctaLabel, ctaLink, startDate, endDate } = req.body;
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                ...(title && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(description !== undefined && { description }),
                ...(details !== undefined && { details: parseDetails(details) }),
                ...(ctaLabel !== undefined && { ctaLabel }),
                ...(ctaLink !== undefined && { ctaLink }),
                ...(startDate && { startDate }),
                endDate: endDate || null
            },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật sự kiện thành công",
            event: updatedEvent
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// DELETE event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sự kiện"
            });
        }
        res.json({
            success: true,
            message: "Xóa sự kiện thành công"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
