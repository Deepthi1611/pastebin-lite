const express = require("express");
const { viewPasteHtml } = require("../controllers/paste");

const router = express.Router();

// HTML view which has no /api prefix
router.get("/p/:id", viewPasteHtml);

module.exports = router;