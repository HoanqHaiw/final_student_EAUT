const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/contact.controller");

// POST /api/contact
router.post("/", createContact);

module.exports = router;
