const { FeedUrl } = require("../models");

const addCampaign = async (req, res) => {
    const { campaignId ,feedUrl, source, country, cap, device } = req.body;

    if (!campaignId || !feedUrl || !source || !country || !cap || !device) {
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
            device: parseInt(device, 10),
        });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
    res.status(201).json({ message: "Campaign added successfully" });
}

const getCampaignById = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await FeedUrl.findOne({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

const updateCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { source, country, cap, status } = req.body;

  try {
    const [updatedRows] = await FeedUrl.update(
      {
        source,
        country,
        cap: parseInt(cap, 10),
        status,
      },
      {
        where: { campaign_id: campaignId },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const updatedCampaign = await FeedUrl.findOne({
      where: { campaign_id: campaignId },
    });

    res.json({
      message: "Campaign updated successfully",
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

module.exports = {
    addCampaign,
    getCampaignById,
    updateCampaign,
}