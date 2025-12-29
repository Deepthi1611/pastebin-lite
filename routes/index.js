const express = require('express');
const healthRoute = require('./health');
const pasteRoute = require('./paste');

const router = express.Router();
router.use("/healthz", healthRoute);
router.use("/pastes", pasteRoute);

module.exports = router;