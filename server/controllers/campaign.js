const { FeedUrl } = require("../models");

const addCampaign = async (req, res) => {
    const { campaignId ,feedUrl, source, country, cap } = req.body;

    if (!campaignId || !feedUrl || !source || !country || !cap) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await FeedUrl.create({
            url: feedUrl,
            campaign_id: campaignId,
            source,
            country,
            cap: parseInt(cap, 10),
            available_cap: parseInt(cap, 10),
        });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
    res.status(201).json({ message: "Campaign added successfully" });
}

module.exports = {
    addCampaign,
}