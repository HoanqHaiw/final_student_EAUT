const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

// GET public active events
router.get("/", eventController.getActiveEvents);

module.exports = router;
