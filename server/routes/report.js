const express = require("express");
const { generateReport } = require("../controllers/report");

const router = express.Router();

router.get("/", generateReport);

module.exports = router;