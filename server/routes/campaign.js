const express = require("express");
const { addCampaign, getCampaignById, updateCampaign } = require("../controllers/campaign");

const router = express.Router();

router.post("/campaign", addCampaign);
router.get("/campaign/:campaignId", getCampaignById);
router.put("/campaign/:campaignId", updateCampaign);

module.exports = router;

