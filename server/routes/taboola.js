const express = require("express");
const { getInsights } = require("../controllers/taboola");

const router = express.Router();

router.get('/insights', getInsights);

module.exports = router;