const express = require("express");
const { addCampaign } = require("../controllers/campaign");

const router = express.Router();

router.post("/campaign", addCampaign);

module.exports = router;

