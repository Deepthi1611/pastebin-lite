const express = require("express");
const {
  createPaste,
  getPaste,
} = require("../controllers/paste");

const router = express.Router();

// Create a paste
router.post("/", createPaste);

// Fetch a paste by ID
router.get("/:id", getPaste);

module.exports = router;