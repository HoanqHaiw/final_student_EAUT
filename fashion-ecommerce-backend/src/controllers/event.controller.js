const Event = require("../models/event.model");

// GET active events
const getActiveEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true }).sort({ startDate: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getActiveEvents
};
