const express = require('express');
const { getInsights } = require('../controllers/facebook');

const router = express.Router();

router.get('/insights', getInsights);

module.exports = router;